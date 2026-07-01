import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';
import { query, RowDataPacket } from '../config/db';
import * as dash from '../services/dashboard.service';

export const overview = asyncHandler(async (req, res) => {
  const companyId = req.user!.companyId;
  const [timeseries, funnel, sources, campaigns] = await Promise.all([
    dash.getTimeseries(companyId),
    dash.getLeadFunnel(companyId),
    dash.getLeadSources(companyId),
    dash.getCampaignOverview(companyId),
  ]);
  ok(res, { timeseries, funnel, sources, campaigns });
});

export const topContent = asyncHandler(async (req, res) => {
  const companyId = req.user!.companyId;
  const where = companyId != null ? 'WHERE company_id = ?' : '';
  const args = companyId != null ? [companyId] : [];
  const rows = await query<RowDataPacket[]>(
    `SELECT id, title, platform, status, published_at FROM posts ${where}
     ORDER BY published_at DESC, created_at DESC LIMIT 10`, args);
  ok(res, rows);
});
