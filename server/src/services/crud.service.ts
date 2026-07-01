import { query, queryOne, execute, RowDataPacket } from '../config/db';
import { ApiError } from '../utils/ApiError';
import { paginate, Paginated } from '../utils/response';

export interface CrudConfig {
  table: string;
  /** Columns clients may write on create/update. */
  writable: string[];
  /** Columns used for text search (LIKE). */
  searchable?: string[];
  /** Columns allowed for sorting. */
  sortable?: string[];
  /** If true, rows are scoped to company_id. */
  companyScoped?: boolean;
}

export interface ListParams {
  companyId: number | null;
  page: number;
  pageSize: number;
  offset: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, string | number>;
}

/** Reusable, injection-safe CRUD built around a whitelist of columns. */
export function makeCrud(cfg: CrudConfig) {
  const scoped = cfg.companyScoped !== false;

  function pickWritable(input: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const key of cfg.writable) {
      if (input[key] !== undefined) out[key] = input[key];
    }
    return out;
  }

  async function list(params: ListParams): Promise<Paginated<RowDataPacket>> {
    const where: string[] = [];
    const args: unknown[] = [];

    if (scoped && params.companyId != null) {
      where.push('company_id = ?');
      args.push(params.companyId);
    }
    if (params.search && cfg.searchable?.length) {
      const like = cfg.searchable.map((c) => `${c} LIKE ?`).join(' OR ');
      where.push(`(${like})`);
      cfg.searchable.forEach(() => args.push(`%${params.search}%`));
    }
    if (params.filters) {
      for (const [k, v] of Object.entries(params.filters)) {
        if (cfg.writable.includes(k) || cfg.sortable?.includes(k)) {
          where.push(`${k} = ?`);
          args.push(v);
        }
      }
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sortCol =
      params.sort && cfg.sortable?.includes(params.sort) ? params.sort : 'created_at';
    const orderDir = params.order === 'asc' ? 'ASC' : 'DESC';

    const totalRow = await queryOne<RowDataPacket & { c: number }>(
      `SELECT COUNT(*) c FROM ${cfg.table} ${whereSql}`,
      args
    );
    const rows = await query<RowDataPacket[]>(
      `SELECT * FROM ${cfg.table} ${whereSql} ORDER BY ${sortCol} ${orderDir} LIMIT ? OFFSET ?`,
      [...args, params.pageSize, params.offset]
    );
    return paginate(rows, Number(totalRow?.c ?? 0), params.page, params.pageSize);
  }

  async function getById(id: number, companyId: number | null): Promise<RowDataPacket> {
    const where = scoped && companyId != null ? 'AND company_id = ?' : '';
    const args = where ? [id, companyId] : [id];
    const row = await queryOne<RowDataPacket>(
      `SELECT * FROM ${cfg.table} WHERE id = ? ${where} LIMIT 1`,
      args
    );
    if (!row) throw ApiError.notFound(`${cfg.table} record not found`);
    return row;
  }

  async function create(input: Record<string, unknown>, companyId: number | null): Promise<RowDataPacket> {
    const data = pickWritable(input);
    if (scoped && companyId != null) data['company_id'] = companyId;
    const keys = Object.keys(data);
    if (keys.length === 0) throw ApiError.badRequest('No valid fields provided');
    const placeholders = keys.map(() => '?').join(', ');
    const result = await execute(
      `INSERT INTO ${cfg.table} (${keys.join(', ')}) VALUES (${placeholders})`,
      keys.map((k) => data[k])
    );
    return getById(result.insertId, companyId);
  }

  async function update(
    id: number,
    input: Record<string, unknown>,
    companyId: number | null
  ): Promise<RowDataPacket> {
    await getById(id, companyId); // ensures existence + scope
    const data = pickWritable(input);
    const keys = Object.keys(data);
    if (keys.length === 0) throw ApiError.badRequest('No valid fields to update');
    const setSql = keys.map((k) => `${k} = ?`).join(', ');
    const where = scoped && companyId != null ? 'AND company_id = ?' : '';
    const args = [...keys.map((k) => data[k]), id, ...(where ? [companyId] : [])];
    await execute(`UPDATE ${cfg.table} SET ${setSql} WHERE id = ? ${where}`, args);
    return getById(id, companyId);
  }

  async function remove(id: number, companyId: number | null): Promise<void> {
    await getById(id, companyId);
    const where = scoped && companyId != null ? 'AND company_id = ?' : '';
    const args = where ? [id, companyId] : [id];
    await execute(`DELETE FROM ${cfg.table} WHERE id = ? ${where}`, args);
  }

  return { list, getById, create, update, remove };
}
