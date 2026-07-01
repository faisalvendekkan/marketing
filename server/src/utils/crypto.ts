import crypto from 'crypto';

/** Generate a URL-safe random token (raw) — store only its SHA-256 hash. */
export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}
