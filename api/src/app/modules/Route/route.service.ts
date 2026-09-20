import httpStatus from 'http-status';
import { SavedRoute } from '@prisma/client';
import prisma from '../../database/prisma';
import AppError from '../../errors/AppError';

const createSavedRoute = async (userId: string, payload: {
  name?: string;
  originLat: number;
  originLng: number;
  originName?: string;
  destLat: number;
  destLng: number;
  destName?: string;
  waypoints?: any[];
  vehicleId?: string;
  distance?: number;
  duration?: number;
  routeData?: any;
  isFavorite?: boolean;
}): Promise<SavedRoute> => {
  if (payload.vehicleId) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: payload.vehicleId, userId },
      select: { id: true },
    });
    if (!vehicle) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Vehicle not found or does not belong to user');
    }
  }

  return prisma.savedRoute.create({
    data: {
      ...payload,
      userId,
    },
  });
};

const getUserRoutes = async (userId: string, query: { isFavorite?: string; limit?: string; page?: string }): Promise<any> => {
  const { isFavorite, limit, page } = query;

  const where: any = { userId };

  if (isFavorite === 'true') {
    where.isFavorite = true;
  } else if (isFavorite === 'false') {
    where.isFavorite = false;
  }

  const take = Math.min(Number(limit) || 20, 100);
  const skip = ((Number(page) || 1) - 1) * take;

  const [data, total] = await Promise.all([
    prisma.savedRoute.findMany({
      where,
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.savedRoute.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page: Number(page) || 1,
      limit: take,
      totalPage: Math.ceil(total / take),
    },
  };
};

const getSingleRoute = async (routeId: string, userId: string): Promise<SavedRoute | null> => {
  const route = await prisma.savedRoute.findFirst({
    where: { id: routeId, userId },
  });

  if (!route) {
    throw new AppError(httpStatus.NOT_FOUND, 'Route not found');
  }

  return route;
};

const updateSavedRoute = async (routeId: string, userId: string, payload: any): Promise<SavedRoute> => {
  const route = await prisma.savedRoute.findFirst({
    where: { id: routeId, userId },
    select: { id: true },
  });

  if (!route) {
    throw new AppError(httpStatus.NOT_FOUND, 'Route not found');
  }

  return prisma.savedRoute.update({
    where: { id: routeId },
    data: payload,
  });
};

const deleteSavedRoute = async (routeId: string, userId: string): Promise<void> => {
  const route = await prisma.savedRoute.findFirst({
    where: { id: routeId, userId },
    select: { id: true },
  });

  if (!route) {
    throw new AppError(httpStatus.NOT_FOUND, 'Route not found');
  }

  await prisma.savedRoute.delete({ where: { id: routeId } });
};

const toggleFavorite = async (routeId: string, userId: string): Promise<SavedRoute> => {
  const route = await prisma.savedRoute.findFirst({
    where: { id: routeId, userId },
  });

  if (!route) {
    throw new AppError(httpStatus.NOT_FOUND, 'Route not found');
  }

  return prisma.savedRoute.update({
    where: { id: routeId },
    data: { isFavorite: !route.isFavorite },
  });
};

export const SavedRouteService = {
  createSavedRoute,
  getUserRoutes,
  getSingleRoute,
  updateSavedRoute,
  deleteSavedRoute,
  toggleFavorite,
};
