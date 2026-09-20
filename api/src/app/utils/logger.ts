import pino from 'pino';
import config from '../config';

const isProduction = config.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

const logger = pino({
  level: isProduction ? 'info' : 'debug',
  transport: !isProduction && !isVercel
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

export default logger;
