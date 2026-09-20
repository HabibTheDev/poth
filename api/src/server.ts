import { Server } from 'http';
import app from './app';
import config from './app/config';
import prisma from './app/database/prisma';
import { seedSuperAdmin } from './app/database/seed';
import logger from './app/utils/logger';
import { initializeSocket } from './app/socket';
import cronService from './app/services/cron.service';

let server: Server;

async function bootstrap() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    await seedSuperAdmin();

    server = app.listen(config.port, () => {
      logger.info({ port: config.port, mode: config.NODE_ENV }, '🚀 Server running');
    });

    initializeSocket(server);

    cronService.startCronJobs();

  } catch (error) {
    logger.error({ error }, '❌ Bootstrap failed');
    process.exit(1);
  }
}

bootstrap();

const gracefulShutdown = async (signal: string) => {
  logger.info({ signal }, '🛑 Shutting down gracefully');

  cronService.stopCronJobs();

  if (server) {
    server.close(async () => {
      logger.info('🛑 HTTP server closed');

      await prisma.$disconnect();
      logger.info('🛑 Database connection closed');

      process.exit(0);
    });

    setTimeout(() => {
      logger.error('⚠️ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  }
};

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ promise, reason }, '❌ Unhandled Rejection');
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.error({ error }, '❌ Uncaught Exception');
  gracefulShutdown('uncaughtException');
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
