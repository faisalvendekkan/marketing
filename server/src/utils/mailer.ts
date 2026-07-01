import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!env.smtp.host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    });
  }
  return transporter;
}

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/** Sends mail if SMTP is configured; otherwise logs (safe no-op in dev). */
export async function sendMail(opts: MailOptions): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    logger.warn('SMTP not configured — email not sent', { to: opts.to, subject: opts.subject });
    return false;
  }
  await t.sendMail({ from: env.smtp.from, ...opts });
  return true;
}
