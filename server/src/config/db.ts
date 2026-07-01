import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { env } from './env';
import { logger } from '../utils/logger';

let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.name,
      waitForConnections: true,
      connectionLimit: env.db.connectionLimit,
      queueLimit: 0,
      namedPlaceholders: true,
      dateStrings: false,
      charset: 'utf8mb4_unicode_ci',
    });
  }
  return pool;
}

/** Run a parameterized query and return typed rows. */
export async function query<T extends RowDataPacket[]>(
  sql: string,
  params?: unknown[] | Record<string, unknown>
): Promise<T> {
  const [rows] = await getPool().query<T>(sql, params as never);
  return rows;
}

/** Run an INSERT/UPDATE/DELETE and return the result header. */
export async function execute(
  sql: string,
  params?: unknown[] | Record<string, unknown>
): Promise<ResultSetHeader> {
  const [result] = await getPool().query<ResultSetHeader>(sql, params as never);
  return result;
}

/** Fetch a single row or null. */
export async function queryOne<T extends RowDataPacket>(
  sql: string,
  params?: unknown[] | Record<string, unknown>
): Promise<T | null> {
  const rows = await query<T[]>(sql, params);
  return rows[0] ?? null;
}

/** Run work inside a transaction with automatic commit/rollback. */
export async function withTransaction<T>(
  fn: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function assertDbConnection(): Promise<void> {
  const conn = await getPool().getConnection();
  try {
    await conn.ping();
    logger.info('MySQL connection established');
  } finally {
    conn.release();
  }
}

export type { RowDataPacket, ResultSetHeader };
