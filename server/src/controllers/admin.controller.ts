import bcrypt from 'bcryptjs';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, created, noContent, parsePageParams, paginate } from '../utils/response';
import { query, queryOne, execute, RowDataPacket } from '../config/db';
import { ApiError } from '../utils/ApiError';
import { logActivity } from '../services/activity.service';

// ---- Users management --------------------------------------------------------
export const listUsers = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePageParams(req.query as Record<string, unknown>);
  const companyId = req.user!.companyId;
  const q = (req.query.search as string) || '';
  const where: string[] = [];
  const args: unknown[] = [];
  if (companyId != null) { where.push('u.company_id = ?'); args.push(companyId); }
  if (q) { where.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)'); args.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const totalRow = await query<(RowDataPacket & { c: number })[]>(
    `SELECT COUNT(*) c FROM users u ${whereSql}`, args);
  const rows = await query<RowDataPacket[]>(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.status, u.avatar_url, u.last_login_at,
            r.name AS role_name, r.slug AS role_slug
     FROM users u JOIN roles r ON r.id = u.role_id ${whereSql}
     ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
    [...args, pageSize, offset]
  );
  ok(res, paginate(rows, Number(totalRow[0]?.c ?? 0), page, pageSize));
});

export const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, roleId } = req.body;
  const existing = await queryOne<RowDataPacket>(`SELECT id FROM users WHERE email = ?`, [email]);
  if (existing) throw ApiError.conflict('A user with this email already exists');
  const hash = await bcrypt.hash(password, 10);
  const result = await execute(
    `INSERT INTO users (company_id, role_id, first_name, last_name, email, password_hash, provider, status, email_verified_at)
     VALUES (?, ?, ?, ?, ?, ?, 'local', 'active', NOW())`,
    [req.user!.companyId, roleId, firstName, lastName ?? null, email, hash]
  );
  await logActivity({ companyId: req.user!.companyId, userId: req.user!.id, action: 'create_user', entityType: 'user', entityId: result.insertId });
  created(res, { id: result.insertId }, 'User created');
});

export const updateUser = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { firstName, lastName, roleId, status } = req.body;
  await execute(
    `UPDATE users SET
       first_name = COALESCE(?, first_name),
       last_name  = COALESCE(?, last_name),
       role_id    = COALESCE(?, role_id),
       status     = COALESCE(?, status)
     WHERE id = ? ${req.user!.companyId != null ? 'AND company_id = ?' : ''}`,
    req.user!.companyId != null
      ? [firstName ?? null, lastName ?? null, roleId ?? null, status ?? null, id, req.user!.companyId]
      : [firstName ?? null, lastName ?? null, roleId ?? null, status ?? null, id]
  );
  ok(res, null, 'User updated');
});

export const deleteUser = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user!.id) throw ApiError.badRequest('You cannot delete your own account');
  await execute(`DELETE FROM users WHERE id = ? ${req.user!.companyId != null ? 'AND company_id = ?' : ''}`,
    req.user!.companyId != null ? [id, req.user!.companyId] : [id]);
  noContent(res);
});

// ---- Roles & permissions -----------------------------------------------------
export const listRoles = asyncHandler(async (_req, res) => {
  const roles = await query<RowDataPacket[]>(
    `SELECT r.id, r.name, r.slug, r.description,
            (SELECT COUNT(*) FROM users u WHERE u.role_id = r.id) AS user_count
     FROM roles r ORDER BY r.id`);
  ok(res, roles);
});

export const listPermissions = asyncHandler(async (_req, res) => {
  const perms = await query<RowDataPacket[]>(
    `SELECT id, name, slug, module FROM permissions ORDER BY module, name`);
  ok(res, perms);
});

export const getRolePermissions = asyncHandler(async (req, res) => {
  const rows = await query<RowDataPacket[]>(
    `SELECT permission_id FROM role_permissions WHERE role_id = ?`, [Number(req.params.id)]);
  ok(res, rows.map((r) => (r as { permission_id: number }).permission_id));
});

export const setRolePermissions = asyncHandler(async (req, res) => {
  const roleId = Number(req.params.id);
  const permissionIds: number[] = Array.isArray(req.body.permissionIds) ? req.body.permissionIds : [];
  await execute(`DELETE FROM role_permissions WHERE role_id = ?`, [roleId]);
  for (const pid of permissionIds) {
    await execute(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`, [roleId, pid]);
  }
  await logActivity({ companyId: req.user!.companyId, userId: req.user!.id, action: 'update_role_permissions', entityType: 'role', entityId: roleId });
  ok(res, null, 'Permissions updated');
});

// ---- Activity & audit logs ---------------------------------------------------
export const activityLogs = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePageParams(req.query as Record<string, unknown>);
  const companyId = req.user!.companyId;
  const where = companyId != null ? 'WHERE a.company_id = ?' : '';
  const args = companyId != null ? [companyId] : [];
  const totalRow = await query<(RowDataPacket & { c: number })[]>(
    `SELECT COUNT(*) c FROM activity_logs a ${where}`, args);
  const rows = await query<RowDataPacket[]>(
    `SELECT a.id, a.action, a.description, a.entity_type, a.entity_id, a.created_at,
            CONCAT(u.first_name,' ',COALESCE(u.last_name,'')) AS user_name
     FROM activity_logs a LEFT JOIN users u ON u.id = a.user_id
     ${where} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
    [...args, pageSize, offset]
  );
  ok(res, paginate(rows, Number(totalRow[0]?.c ?? 0), page, pageSize));
});

// ---- Storage usage -----------------------------------------------------------
export const storageUsage = asyncHandler(async (req, res) => {
  const companyId = req.user!.companyId;
  const where = companyId != null ? 'WHERE company_id = ?' : '';
  const args = companyId != null ? [companyId] : [];
  const row = await queryOne<RowDataPacket & { count: number; bytes: number }>(
    `SELECT COUNT(*) count, COALESCE(SUM(file_size),0) bytes FROM media ${where}`, args);
  ok(res, { files: Number(row?.count ?? 0), bytes: Number(row?.bytes ?? 0) });
});
