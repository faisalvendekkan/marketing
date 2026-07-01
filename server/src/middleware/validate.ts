import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

type Part = 'body' | 'query' | 'params';

/** Validates and replaces req[part] with the parsed, typed value. */
export const validate =
  (schema: ZodSchema, part: Part = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[part]);
      // query/params are read-only getters in Express 5-ready setups; assign safely
      (req as unknown as Record<Part, unknown>)[part] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
        next(ApiError.badRequest('Validation failed', details));
      } else {
        next(err);
      }
    }
  };
