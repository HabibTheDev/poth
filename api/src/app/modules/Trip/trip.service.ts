import httpStatus from 'http-status';
import { Trip, TripStatus } from '@prisma/client';
import prisma from '../../database/prisma';
import AppError from '../../errors/AppError';

const createTrip = async (userId: string, payload: {
  vehicleId?: string;
  originLat: number;
  originLng: number;
  originName?: string;
  destLat: number;
  destLng: number;
  destName?: string;
  waypoints?: any[];
  distance: number;
  duration: number;
  startTime?: string;
  estimatedFuel?: number;
  estimatedCost?: number;
  tollCost?: number;
  tollPoints?: any[];
  routeGeometry?: string;
}): Promise<Trip> => {
  if (payload.vehicleId) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: payload.vehicleId, userId },
      select: { id: true },
    });
    if (!vehicle) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Vehicle not found or does not belong to user');
    }
  }

  return prisma.trip.create({
    data: {
      ...payload,
      userId,
      status: TripStatus.IN_PROGRESS,
      startTime: payload.startTime ? new Date(payload.startTime) : new Date(),
    },
  });
};

const getUserTrips = async (userId: string, query: {
  vehicleId?: string;
  status?: string;
  page?: string;
  limit?: string;
  startDate?: string;
  endDate?: string;
}): Promise<any> => {
  const { vehicleId, status, page, limit, startDate, endDate } = query;

  const where: any = { userId };

  if (vehicleId) where.vehicleId = vehicleId;
  if (status) where.status = status;

  if (startDate || endDate) {
    where.startTime = {};
    if (startDate) where.startTime.gte = new Date(startDate);
    if (endDate) where.startTime.lte = new Date(endDate);
  }

  const take = Math.min(Number(limit) || 20, 100);
  const skip = ((Number(page) || 1) - 1) * take;

  const [data, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      skip,
      take,
      orderBy: { startTime: 'desc' },
      include: {
        vehicle: {
          select: { id: true, name: true, brand: true, model: true, fuelType: true },
        },
        fuelRecords: true,
      },
    }),
    prisma.trip.count({ where }),
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

const getSingleTrip = async (tripId: string, userId: string): Promise<Trip | null> => {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    include: {
      vehicle: true,
      fuelRecords: true,
    },
  });

  if (!trip) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trip not found');
  }

  return trip;
};

const completeTrip = async (tripId: string, userId: string, payload: {
  actualFuelUsed?: number;
  actualCost?: number;
  endTime?: string;
}): Promise<Trip> => {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    select: { id: true, status: true },
  });

  if (!trip) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trip not found');
  }

  if (trip.status !== TripStatus.IN_PROGRESS) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Trip is not in progress');
  }

  return prisma.trip.update({
    where: { id: tripId },
    data: {
      status: TripStatus.COMPLETED,
      ...payload,
      endTime: payload.endTime ? new Date(payload.endTime) : new Date(),
    },
  });
};

const cancelTrip = async (tripId: string, userId: string): Promise<Trip> => {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    select: { id: true, status: true },
  });

  if (!trip) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trip not found');
  }

  if (trip.status === TripStatus.COMPLETED) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cannot cancel a completed trip');
  }

  return prisma.trip.update({
    where: { id: tripId },
    data: { status: TripStatus.CANCELLED, endTime: new Date() },
  });
};

const deleteTrip = async (tripId: string, userId: string): Promise<void> => {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    select: { id: true },
  });

  if (!trip) {
    throw new AppError(httpStatus.NOT_FOUND, 'Trip not found');
  }

  await prisma.trip.delete({ where: { id: tripId } });
};

const getTripStats = async (userId: string, days: number = 30): Promise<any> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [totalTrips, totalDistance, totalCost, completedTrips, fuelUsed] = await Promise.all([
    prisma.trip.count({ where: { userId, startTime: { gte: startDate } } }),
    prisma.trip.aggregate({ where: { userId, startTime: { gte: startDate } }, _sum: { distance: true } }),
    prisma.trip.aggregate({ where: { userId, startTime: { gte: startDate } }, _sum: { actualCost: true, estimatedCost: true } }),
    prisma.trip.findMany({
      where: { userId, status: TripStatus.COMPLETED, startTime: { gte: startDate } },
      select: { distance: true, actualFuelUsed: true, actualCost: true, estimatedCost: true },
    }),
    prisma.fuelRecord.aggregate({ where: { userId, timestamp: { gte: startDate } }, _sum: { amount: true, cost: true } }),
  ]);

  const totalActualDistance = totalDistance._sum.distance ?? 0;
  const totalActualCost = totalCost._sum.actualCost ?? 0;
  const totalEstimatedCost = totalCost._sum.estimatedCost ?? 0;

  const avgEfficiency = completedTrips.length > 0
    ? completedTrips.reduce((sum, t) => sum + (t.actualCost ?? 0), 0) / completedTrips.length
    : 0;

  return {
    period: `${days} days`,
    totalTrips,
    totalDistance: Math.round(totalActualDistance / 1000),
    totalCost: Math.round(totalActualCost),
    estimatedCost: Math.round(totalEstimatedCost),
    avgCostPerTrip: completedTrips.length > 0 ? Math.round(avgEfficiency) : 0,
    fuelUsed: fuelUsed._sum.amount ?? 0,
    fuelCost: fuelUsed._sum.cost ?? 0,
    trips: completedTrips,
  };
};

export const TripService = {
  createTrip,
  getUserTrips,
  getSingleTrip,
  completeTrip,
  cancelTrip,
  deleteTrip,
  getTripStats,
};
