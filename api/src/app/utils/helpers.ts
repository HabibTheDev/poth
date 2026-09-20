import { Prisma } from '@prisma/client';

export const exclude = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const buildPaginationParams = (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  return {
    skip,
    take: limit,
  };
};

export const buildPaginationMeta = (total: number, page: number = 1, limit: number = 10) => {
  return {
    total,
    page,
    limit,
    totalPage: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPreviousPage: page > 1,
  };
};

export const buildSearchQuery = (
  searchTerm: string,
  searchFields: string[]
): Prisma.UserWhereInput => {
  if (!searchTerm || searchFields.length === 0) {
    return {};
  }

  return {
    OR: searchFields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: Prisma.QueryMode.insensitive,
      },
    })),
  };
};
