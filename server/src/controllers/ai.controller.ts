import * as ai from '../services/ai.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';
import { query, RowDataPacket } from '../config/db';
import { parsePageParams, paginate } from '../utils/response';

export const status = asyncHandler(async (_req, res) => {
  ok(res, { configured: ai.isConfigured() });
});

export const generate = asyncHandler(async (req, res) => {
  const result = await ai.generate(req.body, {
    companyId: req.user!.companyId,
    userId: req.user!.id,
  });
  ok(res, result, 'Content generated');
});

export const history = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePageParams(req.query as Record<string, unknown>);
  const companyId = req.user!.companyId;
  const where = companyId != null ? 'WHERE company_id = ?' : '';
  const args = companyId != null ? [companyId] : [];
  const totalRow = await query<(RowDataPacket & { c: number })[]>(
    `SELECT COUNT(*) c FROM prompt_history ${where}`, args);
  const rows = await query<RowDataPacket[]>(
    `SELECT id, feature, prompt, result, tone, language, model, created_at
     FROM prompt_history ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...args, pageSize, offset]
  );
  ok(res, paginate(rows, Number(totalRow[0]?.c ?? 0), page, pageSize));
});
