import httpStatus from 'http-status';
import { PlaceType, PlaceSource } from '@prisma/client';
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

const searchPlaces = async (query: {
  q: string;
  lat?: string;
  lng?: string;
  radius?: string;
  type?: string;
  limit?: string;
}): Promise<any[]> => {
  const { q, lat, lng, radius, type, limit } = query;

  const where: any = {
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { address: { contains: q, mode: 'insensitive' } },
    ],
  };

  if (type) {
    where.type = type;
  }

  const results = await prisma.place.findMany({
    where,
    take: Math.min(Number(limit) || 50, 200),
    orderBy: { name: 'asc' },
  });

  let filtered: any[] = results;

  if (lat && lng) {
    const centerLat = parseFloat(lat);
    const centerLng = parseFloat(lng);
    const radiusKm = parseFloat(radius || '20');

    filtered = results
      .map((place) => ({
        ...place,
        distance: haversineDistance(centerLat, centerLng, place.latitude, place.longitude),
      }))
      .filter((place) => place.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return filtered.map(({ distance, ...place }) => ({
      ...place,
      distanceKm: Math.round(distance * 1000) / 1000,
    }));
  }

  return filtered;
};

const getNearbyPlaces = async (query: {
  lat: string;
  lng: string;
  radius?: string;
  type?: string;
  limit?: string;
}): Promise<any[]> => {
  const { lat, lng, radius, type, limit } = query;

  const centerLat = parseFloat(lat);
  const centerLng = parseFloat(lng);
  const radiusKm = parseFloat(radius || '10');

  const where: any = {
    latitude: {
      gte: centerLat - (radiusKm / EARTH_RADIUS_KM) * 180 / Math.PI,
      lte: centerLat + (radiusKm / EARTH_RADIUS_KM) * 180 / Math.PI,
    },
    longitude: {
      gte: centerLng - (radiusKm / EARTH_RADIUS_KM) * 180 / Math.PI / Math.cos(toRad(centerLat)),
      lte: centerLng + (radiusKm / EARTH_RADIUS_KM) * 180 / Math.PI / Math.cos(toRad(centerLat)),
    },
  };

  if (type) {
    where.type = type;
  }

  const results = await prisma.place.findMany({
    where,
    take: Math.min(Number(limit) || 100, 200),
  });

  return results
    .map((place) => ({
      ...place,
      distanceKm: haversineDistance(centerLat, centerLng, place.latitude, place.longitude),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
};

const getPlaceById = async (id: string): Promise<any> => {
  const place = await prisma.place.findUnique({
    where: { id },
  });

  if (!place) {
    throw new AppError(httpStatus.NOT_FOUND, 'Place not found');
  }

  return place;
};

const createPlace = async (payload: {
  name: string;
  nameLocal?: string;
  latitude: number;
  longitude: number;
  type: string;
  address?: string;
  phone?: string;
  website?: string;
  tags?: string[];
  metadata?: any;
}): Promise<any> => {
  if (payload.latitude < -90 || payload.latitude > 90) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid latitude');
  }
  if (payload.longitude < -180 || payload.longitude > 180) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid longitude');
  }

  return prisma.place.create({
    data: {
      ...payload,
      type: payload.type as PlaceType,
      source: PlaceSource.CUSTOM,
      tags: payload.tags || [],
    },
  });
};

const updatePlace = async (id: string, payload: any): Promise<any> => {
  const place = await prisma.place.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!place) {
    throw new AppError(httpStatus.NOT_FOUND, 'Place not found');
  }

  return prisma.place.update({
    where: { id },
    data: payload,
  });
};

const deletePlace = async (id: string): Promise<void> => {
  const place = await prisma.place.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!place) {
    throw new AppError(httpStatus.NOT_FOUND, 'Place not found');
  }

  await prisma.place.delete({ where: { id } });
};

export const PlaceService = {
  searchPlaces,
  getNearbyPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
};
