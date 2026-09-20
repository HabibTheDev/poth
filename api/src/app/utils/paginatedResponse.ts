import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

interface PaginatedResponseData<T> {
  data: T[];
  meta: PaginationMeta;
}

const sendPaginatedResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  result: PaginatedResponseData<T>
) => {
  res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    meta: result.meta,
    data: result.data,
  });
};

export { sendPaginatedResponse, PaginatedResponseData, PaginationMeta };
