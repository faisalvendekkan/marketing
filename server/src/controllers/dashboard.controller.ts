import * as svc from '../services/dashboard.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';

export const overview = asyncHandler(async (req, res) => {
  const data = await svc.getFullDashboard(req.user!.companyId);
  ok(res, data);
});

export const stats = asyncHandler(async (req, res) => {
  ok(res, await svc.getStats(req.user!.companyId));
});
