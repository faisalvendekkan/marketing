import { query, queryOne, RowDataPacket } from '../config/db';

/** Builds a company scope clause. Super admins (companyId null) see all data. */
function scope(companyId: number | null, col = 'company_id') {
  if (companyId == null) return { clause: '1=1', params: [] as unknown[] };
  return { clause: `${col} = ?`, params: [companyId] as unknown[] };
}

export async function getStats(companyId: number | null) {
  const s = scope(companyId);
  const [campaigns, leads, posts, tasks, revenue] = await Promise.all([
    queryOne<RowDataPacket & { total: number; active: number }>(
      `SELECT COUNT(*) total, SUM(status='active') active FROM campaigns WHERE ${s.clause}`, s.params),
    queryOne<RowDataPacket & { total: number; won: number; value: number }>(
      `SELECT COUNT(*) total, SUM(status='won') won, COALESCE(SUM(value),0) value FROM leads WHERE ${s.clause}`, s.params),
    queryOne<RowDataPacket & { total: number; scheduled: number }>(
      `SELECT COUNT(*) total, SUM(status='scheduled') scheduled FROM posts WHERE ${s.clause}`, s.params),
    queryOne<RowDataPacket & { total: number; open: number }>(
      `SELECT COUNT(*) total, SUM(status<>'done') open FROM tasks WHERE ${s.clause}`, s.params),
    queryOne<RowDataPacket & { spent: number; budget: number }>(
      `SELECT COALESCE(SUM(spent),0) spent, COALESCE(SUM(budget),0) budget FROM campaigns WHERE ${s.clause}`, s.params),
  ]);

  return {
    campaigns: { total: Number(campaigns?.total ?? 0), active: Number(campaigns?.active ?? 0) },
    leads: {
      total: Number(leads?.total ?? 0),
      won: Number(leads?.won ?? 0),
      pipelineValue: Number(leads?.value ?? 0),
    },
    posts: { total: Number(posts?.total ?? 0), scheduled: Number(posts?.scheduled ?? 0) },
    tasks: { total: Number(tasks?.total ?? 0), open: Number(tasks?.open ?? 0) },
    budget: { spent: Number(revenue?.spent ?? 0), total: Number(revenue?.budget ?? 0) },
  };
}

export async function getTimeseries(companyId: number | null) {
  const s = scope(companyId);
  const rows = await query<(RowDataPacket & { d: string; metric: string; value: number })[]>(
    `SELECT DATE_FORMAT(event_date,'%Y-%m-%d') d, metric, SUM(value) value
     FROM analytics_events
     WHERE ${s.clause} AND event_date >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
       AND metric IN ('traffic','conversions')
     GROUP BY d, metric ORDER BY d ASC`,
    s.params
  );
  const map = new Map<string, { date: string; traffic: number; conversions: number }>();
  for (const r of rows) {
    const e = map.get(r.d) ?? { date: r.d, traffic: 0, conversions: 0 };
    if (r.metric === 'traffic') e.traffic = Number(r.value);
    if (r.metric === 'conversions') e.conversions = Number(r.value);
    map.set(r.d, e);
  }
  return Array.from(map.values());
}

export async function getLeadFunnel(companyId: number | null) {
  const s = scope(companyId);
  const rows = await query<(RowDataPacket & { status: string; count: number })[]>(
    `SELECT status, COUNT(*) count FROM leads WHERE ${s.clause} GROUP BY status`, s.params);
  const order = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
  const counts = Object.fromEntries(rows.map((r) => [r.status, Number(r.count)]));
  return order.map((status) => ({ status, count: counts[status] ?? 0 }));
}

export async function getLeadSources(companyId: number | null) {
  const s = scope(companyId, 'l.company_id');
  return query<(RowDataPacket & { source: string; count: number })[]>(
    `SELECT COALESCE(ls.name,'Unknown') source, COUNT(*) count
     FROM leads l LEFT JOIN lead_sources ls ON ls.id = l.source_id
     WHERE ${s.clause} GROUP BY source ORDER BY count DESC`, s.params);
}

export async function getCampaignOverview(companyId: number | null) {
  const s = scope(companyId);
  return query<RowDataPacket[]>(
    `SELECT id, name, status, budget, spent,
            ROUND(CASE WHEN budget > 0 THEN spent/budget*100 ELSE 0 END, 1) AS budget_used
     FROM campaigns WHERE ${s.clause} ORDER BY updated_at DESC LIMIT 6`, s.params);
}

export async function getUpcomingPosts(companyId: number | null) {
  const s = scope(companyId, 'p.company_id');
  return query<RowDataPacket[]>(
    `SELECT p.id, p.title, p.platform, p.status, ps.scheduled_at
     FROM posts p LEFT JOIN post_schedules ps ON ps.post_id = p.id
     WHERE ${s.clause} AND p.status IN ('scheduled','pending_approval','approved')
     ORDER BY COALESCE(ps.scheduled_at, p.created_at) ASC LIMIT 6`, s.params);
}

export async function getRecentActivity(companyId: number | null) {
  const s = scope(companyId);
  return query<RowDataPacket[]>(
    `SELECT a.id, a.action, a.description, a.entity_type, a.created_at,
            CONCAT(u.first_name,' ',COALESCE(u.last_name,'')) AS user_name
     FROM activity_logs a LEFT JOIN users u ON u.id = a.user_id
     WHERE ${s.clause} ORDER BY a.created_at DESC LIMIT 10`, s.params);
}

export async function getTaskSummary(companyId: number | null) {
  const s = scope(companyId);
  const rows = await query<(RowDataPacket & { status: string; count: number })[]>(
    `SELECT status, COUNT(*) count FROM tasks WHERE ${s.clause} GROUP BY status`, s.params);
  const counts = Object.fromEntries(rows.map((r) => [r.status, Number(r.count)]));
  return {
    todo: counts['todo'] ?? 0,
    in_progress: counts['in_progress'] ?? 0,
    review: counts['review'] ?? 0,
    done: counts['done'] ?? 0,
  };
}

export async function getFullDashboard(companyId: number | null) {
  const [stats, timeseries, funnel, sources, campaigns, upcoming, activity, taskSummary] =
    await Promise.all([
      getStats(companyId),
      getTimeseries(companyId),
      getLeadFunnel(companyId),
      getLeadSources(companyId),
      getCampaignOverview(companyId),
      getUpcomingPosts(companyId),
      getRecentActivity(companyId),
      getTaskSummary(companyId),
    ]);
  return { stats, timeseries, funnel, sources, campaigns, upcoming, activity, taskSummary };
}
