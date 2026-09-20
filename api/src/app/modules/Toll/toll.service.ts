import httpStatus from 'http-status';
import { TollPoint } from '@prisma/client';
import prisma from '../../database/prisma';
import AppError from '../../errors/AppError';

const EARTH_RADIUS_KM = 6371;

const toRad = (value: number): number => (value * Math.PI) / 180;

const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

const createTollPoint = async (payload: {
  name: string;
  latitude: number;
  longitude: number;
  price: number;
  vehicleClass?: string;
  metadata?: any;
}): Promise<TollPoint> => {
  return prisma.tollPoint.create({
    data: payload,
  });
};

const getAllTollPoints = async (query: {
  page?: string;
  limit?: string;
  vehicleClass?: string;
  isActive?: string;
}): Promise<any> => {
  const { page, limit, vehicleClass, isActive } = query;

  const where: any = {};

  if (vehicleClass) {
    where.vehicleClass = vehicleClass;
  }

  if (isActive) {
    where.isActive = isActive === 'true';
  }

  const take = Math.min(Number(limit) || 100, 500);
  const skip = ((Number(page) || 1) - 1) * take;

  const [data, total] = await Promise.all([
    prisma.tollPoint.findMany({
      where,
      skip,
      take,
      orderBy: { name: 'asc' },
    }),
    prisma.tollPoint.count({ where }),
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

const getTollPointById = async (id: string): Promise<TollPoint | null> => {
  const tollPoint = await prisma.tollPoint.findUnique({
    where: { id },
  });

  if (!tollPoint) {
    throw new AppError(httpStatus.NOT_FOUND, 'Toll point not found');
  }

  return tollPoint;
};

const getTollsOnRoute = async (payload: {
  waypoints: { latitude: number; longitude: number }[];
  vehicleClass?: string;
  proximityMeters?: number;
}): Promise<any> => {
  const { waypoints, vehicleClass, proximityMeters = 500 } = payload;
  const proximityKm = proximityMeters / 1000;

  const tolls: any[] = [];

  for (const wp of waypoints) {
    const where: any = {
      latitude: {
        gte: wp.latitude - (proximityKm / EARTH_RADIUS_KM) * 180 / Math.PI,
        lte: wp.latitude + (proximityKm / EARTH_RADIUS_KM) * 180 / Math.PI,
      },
      longitude: {
        gte: wp.longitude - (proximityKm / EARTH_RADIUS_KM) * 180 / Math.PI / Math.cos(toRad(wp.latitude)),
        lte: wp.longitude + (proximityKm / EARTH_RADIUS_KM) * 180 / Math.PI / Math.cos(toRad(wp.latitude)),
      },
      isActive: true,
    };

    if (vehicleClass) {
      where.vehicleClass = vehicleClass;
    }

    const nearbyTolls = await prisma.tollPoint.findMany({
      where,
    });

    nearbyTolls.forEach((toll) => {
      const distance = haversineDistance(wp.latitude, wp.longitude, toll.latitude, toll.longitude);
      if (distance <= proximityKm) {
        const exists = tolls.find((t) => t.id === toll.id);
        if (!exists) {
          tolls.push({
            ...toll,
            distanceKm: Math.round(distance * 100) / 100,
            distanceFromPath: Math.round(distance * 1000),
          });
        }
      }
    });
  }

  return tolls.sort((a, b) => a.distanceKm - b.distanceKm);
};

const updateTollPoint = async (id: string, payload: any): Promise<TollPoint> => {
  const tollPoint = await prisma.tollPoint.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!tollPoint) {
    throw new AppError(httpStatus.NOT_FOUND, 'Toll point not found');
  }

  return prisma.tollPoint.update({
    where: { id },
    data: payload,
  });
};

const deleteTollPoint = async (id: string): Promise<void> => {
  const tollPoint = await prisma.tollPoint.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!tollPoint) {
    throw new AppError(httpStatus.NOT_FOUND, 'Toll point not found');
  }

  await prisma.tollPoint.delete({ where: { id } });
};

export const TollPointService = {
  createTollPoint,
  getAllTollPoints,
  getTollPointById,
  getTollsOnRoute,
  updateTollPoint,
  deleteTollPoint,
};
