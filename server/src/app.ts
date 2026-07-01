import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimit';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { apiRouter } from './routes';

export function createApp(): Application {
  const app = express();

  app.set('trust proxy', 1);

  // Security headers. CSP relaxed enough to serve the bundled SPA + inline styles.
  app.use(
    helmet({
      contentSecurityPolicy: env.isProd
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
              connectSrc: ["'self'", 'https:'],
              fontSrc: ["'self'", 'data:', 'https:'],
            },
          }
        : false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin: env.security.corsOrigin === '*' ? true : env.security.corsOrigin.split(','),
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());
  app.use(morgan(env.isProd ? 'combined' : 'dev'));

  // Static uploads
  const uploadDir = path.resolve(process.cwd(), env.uploads.dir);
  fs.mkdirSync(uploadDir, { recursive: true });
  app.use('/uploads', express.static(uploadDir, { maxAge: '7d' }));

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ success: true, status: 'ok', service: env.appName, time: new Date().toISOString() });
  });

  // API
  app.use('/api', apiLimiter, apiRouter);

  // Serve built client (production single-app deployment on Hostinger)
  const clientDist = path.resolve(process.cwd(), 'client', 'dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist, { maxAge: '1d', index: false }));
    // SPA fallback for non-API routes
    app.get(/^\/(?!api|uploads).*/, (_req: Request, res: Response) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  // 404 for unmatched API routes + error handler
  app.use('/api', notFound);
  app.use(errorHandler);

  return app;
}
