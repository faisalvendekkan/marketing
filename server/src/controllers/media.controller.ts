import path from 'path';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, created, noContent, parsePageParams, paginate } from '../utils/response';
import { query, execute, queryOne, RowDataPacket } from '../config/db';
import { ApiError } from '../utils/ApiError';

function mediaType(mime: string): string {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime === 'application/pdf') return 'document';
  return 'other';
}

export const listMedia = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePageParams(req.query as Record<string, unknown>);
  const companyId = req.user!.companyId;
  const where = companyId != null ? 'WHERE company_id = ?' : '';
  const args = companyId != null ? [companyId] : [];
  const totalRow = await query<(RowDataPacket & { c: number })[]>(
    `SELECT COUNT(*) c FROM media ${where}`, args);
  const rows = await query<RowDataPacket[]>(
    `SELECT * FROM media ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...args, pageSize, offset]
  );
  ok(res, paginate(rows, Number(totalRow[0]?.c ?? 0), page, pageSize));
});

export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');
  const companyId = req.user!.companyId;
  const relPath = `/uploads/${path.basename(req.file.path)}`;
  const type = mediaType(req.file.mimetype);
  const result = await execute(
    `INSERT INTO media (company_id, uploaded_by, file_name, file_path, mime_type, file_size, type, alt_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [companyId, req.user!.id, req.file.originalname, relPath, req.file.mimetype, req.file.size, type, req.body.altText ?? null]
  );
  const row = await queryOne<RowDataPacket>(`SELECT * FROM media WHERE id = ?`, [result.insertId]);
  created(res, row, 'File uploaded');
});

export const deleteMedia = asyncHandler(async (req, res) => {
  const companyId = req.user!.companyId;
  await execute(
    `DELETE FROM media WHERE id = ? ${companyId != null ? 'AND company_id = ?' : ''}`,
    companyId != null ? [Number(req.params.id), companyId] : [Number(req.params.id)]
  );
  noContent(res);
});
