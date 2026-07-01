import { createApp } from './app';
import { env } from './config/env';
import { assertDbConnection } from './config/db';
import { logger } from './utils/logger';

async function bootstrap() {
  const app = createApp();

  try {
    await assertDbConnection();
  } catch (err) {
    logger.error('Failed to connect to MySQL. Check your DB_* environment variables.', {
      message: err instanceof Error ? err.message : String(err),
    });
    // Do not hard-exit in production hosting; keep serving health + static so the
    // platform does not restart-loop. API routes needing DB will return 500.
    if (!env.isProd) process.exit(1);
  }

  const server = app.listen(env.port, () => {
    logger.info(`${env.appName} listening on port ${env.port} [${env.nodeEnv}]`);
  });

  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal bootstrap error', { message: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
