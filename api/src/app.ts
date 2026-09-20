import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import config from './app/config';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const app: Application = express();

// Trust proxy — required for Socket.IO behind Nginx reverse proxy
// Enables proper X-Forwarded-* header handling
app.set('trust proxy', 1);

app.use(helmet());
import { apiLogger } from './app/middlewares/apiLogger';
app.use(apiLogger);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use(
  cors({
    origin: function(origin, callback) {
      const allowedOrigins = config.socket_cors_origin;
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['set-cookie'],
  })
);

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: 'Too many requests from this IP, please try again later',
// });

// app.use('/api', limiter);

app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Backend API',
    version: '2.0.0',
    documentation: '/api-docs',
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1', router);

app.use(globalErrorHandler);

app.use(notFound);

export default app;
