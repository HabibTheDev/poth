import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import catchAsync from '../utils/catchAsync';

const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Parse the body field if it's a JSON string (for multipart/form-data)
    let bodyData = req.body;
    if (req.body.body) {
      try {
        const parsedBody = typeof req.body.body === 'string' 
          ? JSON.parse(req.body.body) 
          : req.body.body;
        bodyData = { body: parsedBody };
      } catch (_error) {
        // If parsing fails, use as is
        bodyData = { body: req.body.body };
      }
    }

    await schema.parseAsync({
      body: bodyData.body || bodyData,
      query: req.query,
      params: req.params,
      cookies: req.cookies,
    });

    next();
  });
};

export default validateRequest;
