import httpStatus from 'http-status';
import { Vehicle, VehicleFuelEfficiency } from '@prisma/client';
import prisma from '../../database/prisma';
import AppError from '../../errors/AppError';

const createVehicle = async (userId: string, payload: {
  name: string;
  brand?: string;
  model?: string;
  year?: number;
  fuelType?: any;
  fuelTankCapacity?: number;
  engineCapacity?: number;
  transmission?: any;
  isPrimary?: boolean;
  color?: string;
  plateNumber?: string;
}): Promise<Vehicle> => {
  if (payload.isPrimary) {
    await prisma.vehicle.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  if (payload.plateNumber) {
    const existing = await prisma.vehicle.findFirst({
      where: { userId, plateNumber: payload.plateNumber },
    });
    if (existing) {
      throw new AppError(httpStatus.CONFLICT, 'Vehicle with this plate number already exists');
    }
  }

  return prisma.vehicle.create({
    data: {
      ...payload,
      userId,
    },
  });
};

const getUserVehicles = async (userId: string): Promise<Vehicle[]> => {
  return prisma.vehicle.findMany({
    where: { userId, isDeleted: false },
    orderBy: { isPrimary: 'desc', createdAt: 'desc' },
    include: {
      fuelEfficiencies: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
};

const getSingleVehicle = async (vehicleId: string, userId: string): Promise<Vehicle | null> => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId },
  });

  if (!vehicle) {
    throw new AppError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }

  return vehicle;
};

const updateVehicle = async (vehicleId: string, userId: string, payload: Partial<Vehicle>): Promise<Vehicle> => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId },
  });

  if (!vehicle) {
    throw new AppError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }

  if (payload.isPrimary === true) {
    await prisma.vehicle.updateMany({
      where: { userId, isPrimary: true, id: { not: vehicleId } },
      data: { isPrimary: false },
    });
  }

  if (payload.plateNumber && payload.plateNumber !== vehicle.plateNumber) {
    const existing = await prisma.vehicle.findFirst({
      where: { userId, plateNumber: payload.plateNumber, id: { not: vehicleId } },
    });
    if (existing) {
      throw new AppError(httpStatus.CONFLICT, 'Vehicle with this plate number already exists');
    }
  }

  return prisma.vehicle.update({
    where: { id: vehicleId },
    data: payload,
  });
};

const deleteVehicle = async (vehicleId: string, userId: string): Promise<void> => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId },
  });

  if (!vehicle) {
    throw new AppError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }

  if (vehicle.isPrimary) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cannot delete the primary vehicle. Set another as primary first.');
  }

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { isDeleted: true },
  });
};

const setPrimary = async (vehicleId: string, userId: string): Promise<Vehicle> => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId },
  });

  if (!vehicle) {
    throw new AppError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }

  await prisma.$transaction(async (tx) => {
    await tx.vehicle.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });

    await tx.vehicle.update({
      where: { id: vehicleId },
      data: { isPrimary: true },
    });
  });

  return prisma.vehicle.findUnique({
    where: { id: vehicleId },
  }) as Promise<Vehicle>;
};

const addFuelEfficiency = async (vehicleId: string, userId: string, payload: {
  fuelType: any;
  averageMileage: number;
  distanceUnit: string;
  volumeUnit: string;
  source: string;
}): Promise<VehicleFuelEfficiency> => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId },
  });

  if (!vehicle) {
    throw new AppError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }

  await prisma.vehicleFuelEfficiency.updateMany({
    where: { vehicleId, isActive: true },
    data: { isActive: false },
  });

  return prisma.vehicleFuelEfficiency.create({
    data: {
      ...payload,
      vehicleId,
    },
  });
};

const getFuelEfficiencies = async (vehicleId: string, userId: string): Promise<VehicleFuelEfficiency[]> => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, userId },
  });

  if (!vehicle) {
    throw new AppError(httpStatus.NOT_FOUND, 'Vehicle not found');
  }

  return prisma.vehicleFuelEfficiency.findMany({
    where: { vehicleId },
    orderBy: { createdAt: 'desc' },
  });
};

export const VehicleService = {
  createVehicle,
  getUserVehicles,
  getSingleVehicle,
  updateVehicle,
  deleteVehicle,
  setPrimary,
  addFuelEfficiency,
  getFuelEfficiencies,
};
