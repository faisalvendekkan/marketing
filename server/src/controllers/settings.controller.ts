import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';
import { query, queryOne, execute, RowDataPacket } from '../config/db';
import { ApiError } from '../utils/ApiError';

// ---- Company profile ---------------------------------------------------------
export const getCompany = asyncHandler(async (req, res) => {
  const companyId = req.user!.companyId;
  if (companyId == null) return ok(res, null);
  const company = await queryOne<RowDataPacket>(`SELECT * FROM companies WHERE id = ?`, [companyId]);
  ok(res, company);
});

export const updateCompany = asyncHandler(async (req, res) => {
  const companyId = req.user!.companyId;
  if (companyId == null) throw ApiError.badRequest('No company associated with your account');
  const { name, website, industry, phone, email, address, city, country, timezone, logoUrl } = req.body;
  await execute(
    `UPDATE companies SET
       name = COALESCE(?, name), website = COALESCE(?, website), industry = COALESCE(?, industry),
       phone = COALESCE(?, phone), email = COALESCE(?, email), address = COALESCE(?, address),
       city = COALESCE(?, city), country = COALESCE(?, country), timezone = COALESCE(?, timezone),
       logo_url = COALESCE(?, logo_url)
     WHERE id = ?`,
    [name ?? null, website ?? null, industry ?? null, phone ?? null, email ?? null,
     address ?? null, city ?? null, country ?? null, timezone ?? null, logoUrl ?? null, companyId]
  );
  ok(res, null, 'Company updated');
});

// ---- Brand kit ---------------------------------------------------------------
export const getBrandKit = asyncHandler(async (req, res) => {
  const companyId = req.user!.companyId;
  if (companyId == null) return ok(res, null);
  const kit = await queryOne<RowDataPacket>(
    `SELECT * FROM brand_kits WHERE company_id = ? ORDER BY id ASC LIMIT 1`, [companyId]);
  ok(res, kit);
});

export const upsertBrandKit = asyncHandler(async (req, res) => {
  const companyId = req.user!.companyId;
  if (companyId == null) throw ApiError.badRequest('No company associated with your account');
  const b = req.body;
  const existing = await queryOne<RowDataPacket & { id: number }>(
    `SELECT id FROM brand_kits WHERE company_id = ? ORDER BY id ASC LIMIT 1`, [companyId]);
  if (existing) {
    await execute(
      `UPDATE brand_kits SET name=COALESCE(?,name), primary_color=?, secondary_color=?, accent_color=?,
        logo_url=?, font_heading=?, font_body=?, brand_voice=?, tagline=? WHERE id = ?`,
      [b.name ?? null, b.primaryColor ?? null, b.secondaryColor ?? null, b.accentColor ?? null,
       b.logoUrl ?? null, b.fontHeading ?? null, b.fontBody ?? null, b.brandVoice ?? null, b.tagline ?? null, existing.id]
    );
  } else {
    await execute(
      `INSERT INTO brand_kits (company_id, name, primary_color, secondary_color, accent_color, logo_url, font_heading, font_body, brand_voice, tagline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [companyId, b.name ?? 'Default Brand', b.primaryColor ?? null, b.secondaryColor ?? null, b.accentColor ?? null,
       b.logoUrl ?? null, b.fontHeading ?? null, b.fontBody ?? null, b.brandVoice ?? null, b.tagline ?? null]
    );
  }
  ok(res, null, 'Brand kit saved');
});

// ---- Generic key/value settings ---------------------------------------------
export const getSettings = asyncHandler(async (req, res) => {
  const companyId = req.user!.companyId;
  const rows = await query<RowDataPacket[]>(
    `SELECT setting_key, setting_value FROM settings WHERE company_id ${companyId == null ? 'IS NULL' : '= ?'}`,
    companyId == null ? [] : [companyId]
  );
  const map: Record<string, string | null> = {};
  for (const r of rows) map[(r as { setting_key: string }).setting_key] = (r as { setting_value: string | null }).setting_value;
  ok(res, map);
});

export const updateSettings = asyncHandler(async (req, res) => {
  const companyId = req.user!.companyId;
  const entries = Object.entries(req.body as Record<string, string>);
  for (const [key, value] of entries) {
    await execute(
      `INSERT INTO settings (company_id, scope, setting_key, setting_value)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [companyId, companyId == null ? 'system' : 'company', key, value]
    );
  }
  ok(res, null, 'Settings saved');
});
