import prisma from '../database/prisma';

interface LogInput {
  userId: string;
  category: 'SYSTEM' | 'AUTH' | 'DATA_UPDATE' | 'INCIDENT' | 'REPORT' | 'COMMUNITY' | 'ERROR';
  action: string;
  details?: Record<string, any>;
}

const createLog = async (input: LogInput) => {
  return prisma.systemLog.create({
    data: {
      userId: input.userId,
      category: input.category,
      action: input.action,
      details: input.details ?? {},
    },
  });
};

const getLogs = async (filters: {
  userId?: string;
   category?: 'SYSTEM' | 'AUTH' | 'DATA_UPDATE' | 'INCIDENT' | 'REPORT' | 'COMMUNITY' | 'ERROR' | Array<'SYSTEM' | 'AUTH' | 'DATA_UPDATE' | 'INCIDENT' | 'REPORT' | 'COMMUNITY' | 'ERROR'>;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const where: any = {};

  // User scoping — if userId is provided, filter by it
  if (filters.userId) {
    where.userId = filters.userId;
  }

  // Category filter — single or multiple
  if (filters.category) {
    where.category = Array.isArray(filters.category)
      ? { in: filters.category }
      : filters.category;
  }

  // Date range filter
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.createdAt.lte = new Date(filters.endDate + 'T23:59:59.999Z');
    }
  }

  // Search in action or details
  if (filters.search) {
    where.OR = [
      { action: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 50, 100);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.systemLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.systemLog.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getLogById = async (id: string, userId?: string) => {
  const where: any = { id };
  if (userId) where.userId = userId;

  const log = await prisma.systemLog.findFirst({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return log;
};

const deleteOldLogs = async (daysOld: number = 90) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);

  return prisma.systemLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
};

const getLogStats = async (userId?: string) => {
  const where: any = {};
  if (userId) where.userId = userId;

  const categories = await prisma.systemLog.groupBy({
    by: ['category'],
    where,
    _count: { category: true },
  });

  const total = await prisma.systemLog.count({ where });

  const stats: Record<string, number> = {};
  categories.forEach((c) => {
    stats[c.category] = c._count.category;
  });

  return {
    total,
    categories: stats,
  };
};

export const LogService = {
  createLog,
  getLogs,
  getLogById,
  deleteOldLogs,
  getLogStats,
};
