import bcrypt from 'bcryptjs';
import { query, queryOne, execute, withTransaction, RowDataPacket } from '../config/db';
import { ApiError } from '../utils/ApiError';
import { generateToken, sha256 } from '../utils/crypto';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { sendMail } from '../utils/mailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { RegisterInput } from '../validators/auth.validator';

interface UserRow extends RowDataPacket {
  id: number;
  company_id: number | null;
  role_id: number;
  role_slug: string;
  first_name: string;
  last_name: string | null;
  email: string;
  password_hash: string | null;
  avatar_url: string | null;
  status: string;
  email_verified_at: Date | null;
  two_factor_enabled: number;
  google_id: string | null;
}

const SALT_ROUNDS = 10;
const REFRESH_DAYS = 7;

export interface PublicUser {
  id: number;
  companyId: number | null;
  role: string;
  firstName: string;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
  emailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function toPublic(u: UserRow): PublicUser {
  return {
    id: u.id,
    companyId: u.company_id,
    role: u.role_slug,
    firstName: u.first_name,
    lastName: u.last_name,
    email: u.email,
    avatarUrl: u.avatar_url,
    emailVerified: !!u.email_verified_at,
  };
}

async function findByEmail(email: string): Promise<UserRow | null> {
  return queryOne<UserRow>(
    `SELECT u.*, r.slug AS role_slug FROM users u
     JOIN roles r ON r.id = u.role_id WHERE u.email = ? LIMIT 1`,
    [email]
  );
}

async function findById(id: number): Promise<UserRow | null> {
  return queryOne<UserRow>(
    `SELECT u.*, r.slug AS role_slug FROM users u
     JOIN roles r ON r.id = u.role_id WHERE u.id = ? LIMIT 1`,
    [id]
  );
}

async function issueTokens(u: UserRow, meta?: { ip?: string; ua?: string }): Promise<AuthTokens> {
  const accessToken = signAccessToken({
    sub: u.id,
    companyId: u.company_id,
    role: u.role_slug,
    email: u.email,
  });
  const jti = generateToken(24);
  const refreshToken = signRefreshToken({ sub: u.id, jti });
  const expires = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);
  await execute(
    `INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [u.id, sha256(jti), meta?.ua ?? null, meta?.ip ?? null, expires]
  );
  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput): Promise<{ user: PublicUser; tokens: AuthTokens }> {
  const existing = await findByEmail(input.email);
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const userId = await withTransaction(async (conn) => {
    let companyId: number | null = null;
    if (input.companyName) {
      const slug =
        input.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 150) +
        '-' + generateToken(3);
      const [c] = await conn.query(
        `INSERT INTO companies (name, slug) VALUES (?, ?)`,
        [input.companyName, slug]
      );
      companyId = (c as { insertId: number }).insertId;
    }
    // New self-serve signups become company Admin (role_id 2). First-ever user handled by seed.
    const [u] = await conn.query(
      `INSERT INTO users (company_id, role_id, first_name, last_name, email, password_hash, provider, status)
       VALUES (?, 2, ?, ?, ?, ?, 'local', 'active')`,
      [companyId, input.firstName, input.lastName ?? null, input.email, passwordHash]
    );
    return (u as { insertId: number }).insertId;
  });

  const user = await findById(userId);
  if (!user) throw ApiError.internal('Failed to create user');

  await sendVerificationEmail(user).catch((e) =>
    logger.warn('Verification email failed', { message: String(e) })
  );

  const tokens = await issueTokens(user);
  return { user: toPublic(user), tokens };
}

export async function login(
  email: string,
  password: string,
  meta?: { ip?: string; ua?: string }
): Promise<{ user: PublicUser; tokens: AuthTokens }> {
  const user = await findByEmail(email);
  if (!user || !user.password_hash) throw ApiError.unauthorized('Invalid email or password');
  if (user.status === 'suspended') throw ApiError.forbidden('This account is suspended');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw ApiError.unauthorized('Invalid email or password');

  await execute(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [user.id]);
  const tokens = await issueTokens(user, meta);
  return { user: toPublic(user), tokens };
}

export async function refresh(refreshToken: string, meta?: { ip?: string; ua?: string }): Promise<AuthTokens> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }
  const tokenHash = sha256(payload.jti);
  const row = await queryOne<RowDataPacket & { id: number; expires_at: Date; revoked_at: Date | null }>(
    `SELECT id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = ? AND user_id = ? LIMIT 1`,
    [tokenHash, payload.sub]
  );
  if (!row || row.revoked_at || new Date(row.expires_at) < new Date()) {
    throw ApiError.unauthorized('Refresh token expired or revoked');
  }
  // Rotate: revoke the old one, issue a new pair.
  await execute(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?`, [row.id]);
  const user = await findById(payload.sub);
  if (!user) throw ApiError.unauthorized('User not found');
  return issueTokens(user, meta);
}

export async function logout(refreshToken?: string): Promise<void> {
  if (!refreshToken) return;
  try {
    const payload = verifyRefreshToken(refreshToken);
    await execute(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?`, [
      sha256(payload.jti),
    ]);
  } catch {
    /* ignore invalid token on logout */
  }
}

export async function getProfile(userId: number): Promise<PublicUser> {
  const user = await findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return toPublic(user);
}

export async function updateProfile(
  userId: number,
  data: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string }
): Promise<PublicUser> {
  await execute(
    `UPDATE users SET
       first_name = COALESCE(?, first_name),
       last_name  = COALESCE(?, last_name),
       phone      = COALESCE(?, phone),
       avatar_url = COALESCE(?, avatar_url)
     WHERE id = ?`,
    [data.firstName ?? null, data.lastName ?? null, data.phone ?? null, data.avatarUrl ?? null, userId]
  );
  return getProfile(userId);
}

export async function changePassword(userId: number, current: string, next: string): Promise<void> {
  const user = await findById(userId);
  if (!user || !user.password_hash) throw ApiError.badRequest('Password change not available for this account');
  const ok = await bcrypt.compare(current, user.password_hash);
  if (!ok) throw ApiError.badRequest('Current password is incorrect');
  const hash = await bcrypt.hash(next, SALT_ROUNDS);
  await execute(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, userId]);
  // Revoke all sessions after a password change.
  await execute(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL`, [userId]);
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await findByEmail(email);
  // Always succeed silently to avoid user enumeration.
  if (!user) return;
  const raw = generateToken(32);
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await execute(
    `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
    [user.id, sha256(raw), expires]
  );
  const link = `${env.clientUrl}/reset-password?token=${raw}`;
  await sendMail({
    to: user.email,
    subject: 'Reset your password',
    html: `<p>Hi ${user.first_name},</p>
           <p>Reset your password using the link below (valid for 1 hour):</p>
           <p><a href="${link}">${link}</a></p>
           <p>If you did not request this, you can ignore this email.</p>`,
  }).catch((e) => logger.warn('Reset email failed', { message: String(e) }));
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const row = await queryOne<RowDataPacket & { id: number; user_id: number; expires_at: Date; used_at: Date | null }>(
    `SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token_hash = ? LIMIT 1`,
    [sha256(token)]
  );
  if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
    throw ApiError.badRequest('Reset link is invalid or has expired');
  }
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  await withTransaction(async (conn) => {
    await conn.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, row.user_id]);
    await conn.query(`UPDATE password_resets SET used_at = NOW() WHERE id = ?`, [row.id]);
    await conn.query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL`, [
      row.user_id,
    ]);
  });
}

export async function sendVerificationEmail(user: UserRow): Promise<void> {
  const raw = generateToken(32);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await execute(
    `INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
    [user.id, sha256(raw), expires]
  );
  const link = `${env.clientUrl}/verify-email?token=${raw}`;
  await sendMail({
    to: user.email,
    subject: 'Verify your email',
    html: `<p>Hi ${user.first_name},</p>
           <p>Confirm your email address:</p>
           <p><a href="${link}">${link}</a></p>`,
  });
}

export async function verifyEmail(token: string): Promise<void> {
  const row = await queryOne<RowDataPacket & { id: number; user_id: number; expires_at: Date; verified_at: Date | null }>(
    `SELECT id, user_id, expires_at, verified_at FROM email_verifications WHERE token_hash = ? LIMIT 1`,
    [sha256(token)]
  );
  if (!row || row.verified_at || new Date(row.expires_at) < new Date()) {
    throw ApiError.badRequest('Verification link is invalid or has expired');
  }
  await withTransaction(async (conn) => {
    await conn.query(`UPDATE email_verifications SET verified_at = NOW() WHERE id = ?`, [row.id]);
    await conn.query(`UPDATE users SET email_verified_at = NOW() WHERE id = ?`, [row.user_id]);
  });
}

interface GoogleTokenInfo {
  aud: string;
  email: string;
  email_verified: string | boolean;
  given_name?: string;
  family_name?: string;
  picture?: string;
  sub: string;
}

/** Verifies a Google ID token via Google's tokeninfo endpoint and logs the user in,
 *  creating an account on first sign-in. Requires GOOGLE_CLIENT_ID. */
export async function googleLogin(
  idToken: string,
  meta?: { ip?: string; ua?: string }
): Promise<{ user: PublicUser; tokens: AuthTokens }> {
  if (!env.google.clientId) throw ApiError.badRequest('Google login is not configured');
  const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!resp.ok) throw ApiError.unauthorized('Invalid Google token');
  const info = (await resp.json()) as GoogleTokenInfo;
  if (info.aud !== env.google.clientId) throw ApiError.unauthorized('Google token audience mismatch');
  const emailVerified = info.email_verified === true || info.email_verified === 'true';
  if (!emailVerified) throw ApiError.unauthorized('Google email not verified');

  let user = await findByEmail(info.email);
  if (!user) {
    const result = await execute(
      `INSERT INTO users (role_id, first_name, last_name, email, google_id, provider, status, email_verified_at)
       VALUES (2, ?, ?, ?, ?, 'google', 'active', NOW())`,
      [info.given_name ?? 'User', info.family_name ?? null, info.email, info.sub]
    );
    user = await findById(result.insertId);
  } else if (!user.google_id) {
    await execute(`UPDATE users SET google_id = ?, provider = 'google' WHERE id = ?`, [info.sub, user.id]);
  }
  if (!user) throw ApiError.internal('Failed to sign in with Google');
  await execute(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [user.id]);
  const tokens = await issueTokens(user, meta);
  return { user: toPublic(user), tokens };
}
