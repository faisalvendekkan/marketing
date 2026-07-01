import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/* eslint-disable @typescript-eslint/no-unused-vars */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let message = 'Internal server error';
  let details: unknown;

  if (err instanceof ApiError) {
    status = err.status;
    message = err.message;
    details = err.details;
  } else if (err instanceof Error) {
    message = err.message || message;
    // MySQL duplicate entry
    if ((err as { code?: string }).code === 'ER_DUP_ENTRY') {
      status = 409;
      message = 'A record with these details already exists';
    }
  }

  if (status >= 500) {
    logger.error('Unhandled error', {
      path: req.path,
      method: req.method,
      message,
      stack: err instanceof Error ? err.stack : undefined,
    });
  }

  res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(env.isProd ? {} : { path: req.path }),
  });
}
