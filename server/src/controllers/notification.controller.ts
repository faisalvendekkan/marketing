import { asyncHandler } from '../utils/asyncHandler';
import { ok, noContent, parsePageParams, paginate } from '../utils/response';
import { query, execute, RowDataPacket } from '../config/db';

export const list = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePageParams(req.query as Record<string, unknown>);
  const userId = req.user!.id;
  const totalRow = await query<(RowDataPacket & { c: number })[]>(
    `SELECT COUNT(*) c FROM notifications WHERE user_id = ?`, [userId]);
  const rows = await query<RowDataPacket[]>(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [userId, pageSize, offset]
  );
  ok(res, paginate(rows, Number(totalRow[0]?.c ?? 0), page, pageSize));
});

export const unreadCount = asyncHandler(async (req, res) => {
  const row = await query<(RowDataPacket & { c: number })[]>(
    `SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND is_read = 0`, [req.user!.id]);
  ok(res, { count: Number(row[0]?.c ?? 0) });
});

export const markRead = asyncHandler(async (req, res) => {
  await execute(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, [
    Number(req.params.id), req.user!.id,
  ]);
  ok(res, null, 'Marked as read');
});

export const markAllRead = asyncHandler(async (req, res) => {
  await execute(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [req.user!.id]);
  ok(res, null, 'All marked as read');
});

export const remove = asyncHandler(async (req, res) => {
  await execute(`DELETE FROM notifications WHERE id = ? AND user_id = ?`, [
    Number(req.params.id), req.user!.id,
  ]);
  noContent(res);
});
