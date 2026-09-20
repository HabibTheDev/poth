import { Request, Response, NextFunction } from 'express';

export const apiLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    if (req.originalUrl.includes('/health') || req.originalUrl.includes('/uploads')) {
      return;
    }

    // Log API metrics (non-blocking, fire-and-forget)
    const logEntry = {
      endpoint: req.originalUrl.split('?')[0],
      method: req.method,
      statusCode: res.statusCode,
      duration,
    };

    if (duration > 1000) {
      console.warn('Slow API call:', logEntry);
    }
  });

  next();
};
