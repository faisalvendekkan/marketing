import { execute } from '../config/db';
import { logger } from '../utils/logger';

export interface ActivityInput {
  companyId: number | null;
  userId: number | null;
  action: string;
  entityType?: string;
  entityId?: number;
  description?: string;
  ip?: string;
}

/** Fire-and-forget activity logging; never throws to the caller. */
export async function logActivity(input: ActivityInput): Promise<void> {
  try {
    await execute(
      `INSERT INTO activity_logs (company_id, user_id, action, entity_type, entity_id, description, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.companyId,
        input.userId,
        input.action,
        input.entityType ?? null,
        input.entityId ?? null,
        input.description ?? null,
        input.ip ?? null,
      ]
    );
  } catch (err) {
    logger.warn('Failed to write activity log', { message: String(err) });
  }
}
