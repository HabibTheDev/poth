import { Prisma } from '@prisma/client';
import { TErrorSources, TGenericErrorResponse } from '../interface/error';

const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError
): TGenericErrorResponse => {
  let statusCode = 400;
  let message = 'Database Error';
  const errorSources: TErrorSources = [];

  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Unique constraint violation';
    const field = (err.meta?.target as string[])?.join(', ') || 'field';
    errorSources.push({
      path: field,
      message: `${field} already exists`,
    });
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
    errorSources.push({
      path: '',
      message: 'The requested record was not found',
    });
  } else if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Foreign key constraint failed';
    errorSources.push({
      path: '',
      message: 'Related record does not exist',
    });
  } else if (err.code === 'P2014') {
    statusCode = 400;
    message = 'Invalid relation';
    errorSources.push({
      path: '',
      message: 'The change you are trying to make would violate a relation',
    });
  } else {
    errorSources.push({
      path: '',
      message: err.message,
    });
  }

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handlePrismaError;
