import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (one level above server/) or server/.env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const bool = (v: string | undefined, def = false) =>
  v == null ? def : ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
const num = (v: string | undefined, def: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
  port: num(process.env.PORT, 3000),
  appName: process.env.APP_NAME || 'Abilix AI Marketing Studio',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  jwt: {
    accessSecret: process.env.JWT_SECRET || 'dev_access_secret_change_me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
  },

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: num(process.env.DB_PORT, 3306),
    name: process.env.DB_NAME || 'abilix_marketing',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    connectionLimit: num(process.env.DB_CONNECTION_LIMIT, 10),
  },

  ai: {
    provider: process.env.AI_PROVIDER || 'openai',
    openaiKey: process.env.OPENAI_API_KEY || '',
    openaiBaseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    anthropicKey: process.env.ANTHROPIC_API_KEY || '',
    anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: num(process.env.SMTP_PORT, 587),
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'Abilix <no-reply@example.com>',
  },

  uploads: {
    dir: process.env.UPLOAD_DIR || 'public/uploads',
    maxMb: num(process.env.MAX_UPLOAD_MB, 10),
  },

  security: {
    rateWindowMin: num(process.env.RATE_LIMIT_WINDOW_MIN, 15),
    rateMax: num(process.env.RATE_LIMIT_MAX, 300),
    corsOrigin: process.env.CORS_ORIGIN || '*',
  },
};

export type Env = typeof env;
