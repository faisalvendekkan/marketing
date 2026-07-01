import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { query, RowDataPacket } from '../config/db';

/** Requires a valid access token; attaches req.user. */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return next(ApiError.unauthorized('Authentication token missing'));
  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      companyId: payload.companyId,
      role: payload.role,
      email: payload.email,
    };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

/** Restricts a route to one of the given role slugs. */
export const authorizeRoles =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden('Insufficient role'));
    next();
  };

interface PermRow extends RowDataPacket {
  slug: string;
}

/** Restricts a route to holders of a specific permission slug. */
export const authorize = (permissionSlug: string) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized();
    if (req.user.role === 'super_admin') return next();
    const rows = await query<PermRow[]>(
      `SELECT p.slug FROM role_permissions rp
       JOIN permissions p ON p.id = rp.permission_id
       JOIN roles r ON r.id = rp.role_id
       WHERE r.slug = ? AND p.slug = ? LIMIT 1`,
      [req.user.role, permissionSlug]
    );
    if (rows.length === 0) throw ApiError.forbidden('You do not have permission to do this');
    next();
  });
