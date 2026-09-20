import prisma from '../database/prisma';
import logger from './logger';

export const executeTransaction = async <T>(
  callback: (tx: typeof prisma) => Promise<T>
): Promise<T> => {
  try {
    return await prisma.$transaction(async (tx) => {
      return await callback(tx as typeof prisma);
    });
  } catch (error) {
    logger.error({ error }, '');
    throw error;
  }
};

export const withTransaction = <T extends any[], R>(
  fn: (...args: [...T, typeof prisma]) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    return executeTransaction(async (tx) => {
      return fn(...args, tx);
    });
  };
};

