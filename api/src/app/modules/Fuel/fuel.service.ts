import httpStatus from 'http-status';
import { FuelRecord, FuelType } from '@prisma/client';
import prisma from '../../database/prisma';
import AppError from '../../errors/AppError';

const createFuelRecord = async (userId: string, payload: {
  vehicleId: string;
  tripId?: string;
  fuelType: FuelType;
  amount: number;
  cost: number;
  vehicleMileage?: number;
  odometerReading?: number;
  stationName?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}): Promise<FuelRecord> => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: payload.vehicleId, userId },
    select: { id: true },
  });

  if (!vehicle) {
    throw new AppError(httpStatus.NOT_FOUND, 'Vehicle not found or does not belong to user');
  }

  return prisma.fuelRecord.create({
    data: {
      ...payload,
      userId,
    },
  });
};

const getUserFuelRecords = async (userId: string, query: {
  vehicleId?: string;
  page?: string;
  limit?: string;
  startDate?: string;
  endDate?: string;
}): Promise<any> => {
  const { vehicleId, page, limit, startDate, endDate } = query;

  const where: any = { userId };

  if (vehicleId) {
    where.vehicleId = vehicleId;
  }

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) where.timestamp.lte = new Date(endDate);
  }

  const take = Math.min(Number(limit) || 50, 200);
  const skip = ((Number(page) || 1) - 1) * take;

  const [data, total] = await Promise.all([
    prisma.fuelRecord.findMany({
      where,
      skip,
      take,
      orderBy: { timestamp: 'desc' },
      include: {
        vehicle: {
          select: { id: true, name: true, brand: true, model: true, fuelType: true },
        },
      },
    }),
    prisma.fuelRecord.count({ where }),
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

const getSingleFuelRecord = async (id: string, userId: string): Promise<FuelRecord | null> => {
  const record = await prisma.fuelRecord.findFirst({
    where: { id, userId },
  });

  if (!record) {
    throw new AppError(httpStatus.NOT_FOUND, 'Fuel record not found');
  }

  return record;
};

const deleteFuelRecord = async (id: string, userId: string): Promise<void> => {
  const record = await prisma.fuelRecord.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!record) {
    throw new AppError(httpStatus.NOT_FOUND, 'Fuel record not found');
  }

  await prisma.fuelRecord.delete({ where: { id } });
};

const predictRange = async (userId: string, vehicleId: string): Promise<any> => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId },
    include: {
      fuelEfficiencies: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!vehicle) {
    throw new AppError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }

  const latestEfficiency = vehicle.fuelEfficiencies[0];
  const mileage = latestEfficiency?.averageMileage ?? 15;
  const tankCapacity = vehicle.fuelTankCapacity ?? 40;

  let estimatedRange = 0;
  if (vehicle.fuelType === 'ELECTRIC') {
    estimatedRange = mileage * tankCapacity;
  } else if (vehicle.fuelType === 'CNG') {
    estimatedRange = mileage * tankCapacity;
  } else {
    estimatedRange = mileage * tankCapacity;
  }

  const lastFill = await prisma.fuelRecord.findFirst({
    where: { vehicleId, userId },
    orderBy: { timestamp: 'desc' },
    select: { amount: true, cost: true, timestamp: true, odometerReading: true },
  });

  const fuelRemaining = lastFill ? tankCapacity - lastFill.amount : 0;
  const rangeWithRemaining = vehicle.fuelType === 'ELECTRIC'
    ? (lastFill ? fuelRemaining * mileage : 0)
    : fuelRemaining * mileage;

  const avgCostPerLiter = await prisma.fuelRecord.aggregate({
    where: { vehicleId, userId },
    _avg: { cost: true, amount: true },
  }).then((agg) => {
    if (!agg._avg.amount || agg._avg.amount === 0) return 0;
    return agg._avg.cost! / agg._avg.amount!;
  });

  return {
    vehicle: {
      id: vehicle.id,
      name: vehicle.name,
      fuelType: vehicle.fuelType,
      fuelTankCapacity: tankCapacity,
      engineCapacity: vehicle.engineCapacity,
    },
    mileage: {
      averageMileage: mileage,
      source: latestEfficiency?.source ?? 'default',
      distanceUnit: latestEfficiency?.distanceUnit ?? 'km',
      volumeUnit: latestEfficiency?.volumeUnit ?? 'liter',
    },
    estimatedRange: {
      fullTankKm: Math.round(estimatedRange),
      withRemainingFuelKm: Math.round(Math.max(0, rangeWithRemaining)),
      estimatedFuelRemaining: Math.round(fuelRemaining * 100) / 100,
    },
    lastFill,
    avgCostPerUnit: avgCostPerLiter,
  };
};

const getFuelStats = async (userId: string, vehicleId?: string): Promise<any> => {
  const where: any = { userId };
  if (vehicleId) where.vehicleId = vehicleId;

  const [totalRecords, totalCost, recentRecords] = await Promise.all([
    prisma.fuelRecord.count({ where }),
    prisma.fuelRecord.aggregate({ where, _sum: { cost: true, amount: true } }),
    prisma.fuelRecord.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 10,
      include: {
        vehicle: { select: { id: true, name: true } },
      },
    }),
  ]);

  return {
    totalRecords,
    totalCost: totalCost._sum.cost ?? 0,
    totalFuel: totalCost._sum.amount ?? 0,
    avgCostPerUnit: totalRecords > 0 && (totalCost._sum.amount ?? 0) > 0
      ? (totalCost._sum.cost ?? 0) / totalCost._sum.amount!
      : 0,
    recentRecords,
  };
};

export const FuelService = {
  createFuelRecord,
  getUserFuelRecords,
  getSingleFuelRecord,
  deleteFuelRecord,
  predictRange,
  getFuelStats,
};
