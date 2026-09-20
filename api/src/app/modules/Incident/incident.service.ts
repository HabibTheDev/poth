import httpStatus from 'http-status';
import { IncidentType, RoadIncident, IncidentStatus } from '@prisma/client';
import prisma from '../../database/prisma';
import AppError from '../../errors/AppError';
import logger from '../../utils/logger';

interface IIncidentQuery {
  type?: string;
  status?: string;
  lat?: string;
  lng?: string;
  radius?: string;
  severity?: string;
  limit?: string;
}

const EARTH_RADIUS_KM = 6371;

const toRad = (value: number): number => (value * Math.PI) / 180;

const haversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

const INCIDENT_EXPIRY_HOURS: Record<string, number> = {
  TRAFFIC_JAM: 2,
  ACCIDENT: 24,
  POLICE: 6,
  ROAD_CLOSURE: 168,
  CONSTRUCTION: 168,
  POTHOLE: 72,
  BAD_ROAD: 120,
  WATERLOGGING: 24,
  BROKEN_SIGNAL: 24,
  TOLL: 168,
  HAZARD: 12,
  VEHICLE_BREAKDOWN: 12,
  FLOOD: 48,
  LANDSLIDE: 168,
  WEATHER: 6,
};

const INCIDENT_ALERT_DISTANCE_M = 100;

const calculateConfidenceScore = (confirmations: { vote: string }[]): number => {
  if (confirmations.length === 0) return 0;

  const confirm = confirmations.filter((c) => c.vote === 'CONFIRM').length;
  const skeptical = confirmations.filter((c) => c.vote === 'SKEPTICAL').length;
  const dismiss = confirmations.filter((c) => c.vote === 'DISMISS').length;

  const score = (confirm - skeptical - dismiss) / confirmations.length;
  return Math.max(-1, Math.min(1, score));
};

const createIncident = async (userId: string, payload: {
  type: IncidentType;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  severity?: string;
}): Promise<RoadIncident> => {
  const { type, title, description, latitude, longitude, severity } = payload;

  const similar = await prisma.roadIncident.findFirst({
    where: {
      type,
      status: IncidentStatus.ACTIVE,
      latitude: { gte: latitude - 0.001, lte: latitude + 0.001 },
      longitude: { gte: longitude - 0.001, lte: longitude + 0.001 },
      createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) },
    },
  });

  if (similar) {
    throw new AppError(
      httpStatus.CONFLICT,
      'A similar incident was reported nearby recently. Please confirm the existing one instead.'
    );
  }

  const expiryHours = INCIDENT_EXPIRY_HOURS[type] ?? 24;
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

  return prisma.roadIncident.create({
    data: {
      type,
      title,
      description,
      latitude,
      longitude,
      severity: severity as any,
      createdById: userId,
      expiresAt,
    },
  });
};

const getNearbyIncidents = async (query: IIncidentQuery): Promise<any[]> => {
  const { type, status, lat, lng, radius, severity, limit } = query;

  const where: any = {
    status: status ? { in: Array.isArray(status) ? status : [status] } : { not: IncidentStatus.EXPIRED },
  };

  if (type) {
    where.type = Array.isArray(type) ? { in: type } : type;
  }

  if (severity) {
    where.severity = Array.isArray(severity) ? { in: severity } : severity;
  }

  where.expiresAt = { gte: new Date() };

  let incidents = await prisma.roadIncident.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: Math.min(Number(limit) || 200, 500),
    include: {
      _count: {
        select: { confirmations: true },
      },
    },
  });

  if (lat && lng) {
    const centerLat = parseFloat(lat);
    const centerLng = parseFloat(lng);
    const radiusKm = parseFloat(radius || '5');

    incidents = incidents.filter((incident) => {
      const dist = haversineDistance(
        centerLat,
        centerLng,
        incident.latitude,
        incident.longitude
      );
      return dist <= radiusKm;
    });

    incidents.sort((a, b) => {
      const distA = haversineDistance(centerLat, centerLng, a.latitude, a.longitude);
      const distB = haversineDistance(centerLat, centerLng, b.latitude, b.longitude);
      return distA - distB;
    });
  }

  return incidents.map((incident) => ({
    id: incident.id,
    type: incident.type,
    title: incident.title,
    description: incident.description,
    latitude: incident.latitude,
    longitude: incident.longitude,
    confidenceScore: incident.confidenceScore,
    status: incident.status,
    severity: incident.severity,
    firstReportedAt: incident.firstReportedAt,
    lastConfirmedAt: incident.lastConfirmedAt,
    expiresAt: incident.expiresAt,
    confirmationCount: incident._count?.confirmations ?? 0,
  }));
};

const getIncidentById = async (id: string): Promise<any> => {
  const incident = await prisma.roadIncident.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, fullName: true, email: true },
      },
      _count: {
        select: { confirmations: true },
      },
      confirmations: {
        where: { vote: 'CONFIRM' },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, fullName: true },
          },
        },
      },
    },
  });

  if (!incident) {
    throw new AppError(httpStatus.NOT_FOUND, 'Incident not found');
  }

  const { createdBy, _count, confirmations, ...rest } = incident;

  return {
    ...rest,
    reportedBy: createdBy,
    confirmationCount: _count?.confirmations ?? 0,
    recentConfirmations: confirmations.map((c) => ({
      userId: c.user.id,
      userName: c.user.fullName,
      createdAt: c.createdAt,
    })),
  };
};

const updateIncident = async (
  id: string,
  userId: string,
  payload: {
    title?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    severity?: string;
    status?: string;
    moderationNotes?: string;
  },
  isModerator: boolean
): Promise<RoadIncident> => {
  const incident = await prisma.roadIncident.findUnique({
    where: { id },
    select: { id: true, createdById: true, status: true },
  });

  if (!incident) {
    throw new AppError(httpStatus.NOT_FOUND, 'Incident not found');
  }

  if (!isModerator && incident.createdById !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only update your own incidents');
  }

  if (!isModerator && payload.status && payload.status !== incident.status) {
    throw new AppError(httpStatus.FORBIDDEN, 'Only moderators can change incident status');
  }

  if (!isModerator && (payload.severity || payload.moderationNotes)) {
    throw new AppError(httpStatus.FORBIDDEN, 'Only moderators can modify severity or moderation notes');
  }

  return prisma.roadIncident.update({
    where: { id },
    data: {
      ...payload,
      status: payload.status as any,
      severity: payload.severity as any,
    },
  });
};

const deleteIncident = async (id: string, userId: string, isModerator: boolean): Promise<void> => {
  const incident = await prisma.roadIncident.findUnique({
    where: { id },
    select: { id: true, createdById: true, status: true },
  });

  if (!incident) {
    throw new AppError(httpStatus.NOT_FOUND, 'Incident not found');
  }

  if (!isModerator && incident.createdById !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only delete your own incidents');
  }

  await prisma.roadIncident.update({
    where: { id },
    data: { status: IncidentStatus.RESOLVED },
  });
};

const confirmIncident = async (
  incidentId: string,
  userId: string,
  vote: 'CONFIRM' | 'SKEPTICAL' | 'DISMISS'
): Promise<any> => {
  const incident = await prisma.roadIncident.findUnique({
    where: { id: incidentId },
    select: { id: true, status: true, type: true },
  });

  if (!incident) {
    throw new AppError(httpStatus.NOT_FOUND, 'Incident not found');
  }

  if (incident.status !== IncidentStatus.ACTIVE) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cannot confirm a non-active incident');
  }

  const existingConfirmation = await prisma.incidentConfirmation.findUnique({
    where: { incidentId_userId: { incidentId, userId } },
  });

  let confirmation;
  if (existingConfirmation) {
    confirmation = await prisma.incidentConfirmation.update({
      where: { incidentId_userId: { incidentId, userId } },
      data: { vote },
    });
  } else {
    confirmation = await prisma.incidentConfirmation.create({
      data: {
        incidentId,
        userId,
        vote,
      },
    });
  }

  const allConfirmations = await prisma.incidentConfirmation.findMany({
    where: { incidentId },
    select: { vote: true },
  });

  const confidenceScore = calculateConfidenceScore(allConfirmations);

  await prisma.roadIncident.update({
    where: { id: incidentId },
    data: {
      confidenceScore,
      lastConfirmedAt: new Date(),
    },
  });

  return {
    incidentId,
    confidenceScore,
    vote: confirmation.vote,
    createdAt: confirmation.createdAt,
  };
};

const getConfirmations = async (incidentId: string, query: { page?: string; limit?: string }) => {
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 50, 100);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.incidentConfirmation.findMany({
      where: { incidentId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    }),
    prisma.incidentConfirmation.count({ where: { incidentId } }),
  ]);

  return {
    data: data.map((c) => ({
      id: c.id,
      vote: c.vote,
      createdAt: c.createdAt,
      user: {
        id: c.user.id,
        fullName: c.user.fullName,
        email: c.user.email,
      },
    })),
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getIncidentStats = async (query: {
  lat: string;
  lng: string;
  radius?: string;
}): Promise<Record<string, number>> => {
  const centerLat = parseFloat(query.lat);
  const centerLng = parseFloat(query.lng);
  const radiusKm = parseFloat(query.radius || '5');

  const incidents = await prisma.roadIncident.findMany({
    where: {
      status: IncidentStatus.ACTIVE,
      expiresAt: { gte: new Date() },
    },
    select: {
      type: true,
      latitude: true,
      longitude: true,
    },
  });

  const stats: Record<string, number> = {};

  incidents.forEach((incident) => {
    const dist = haversineDistance(centerLat, centerLng, incident.latitude, incident.longitude);
    if (dist <= radiusKm) {
      stats[incident.type] = (stats[incident.type] || 0) + 1;
    }
  });

  return stats;
};

const clusterNearbyIncidents = async (
  lat: number,
  lng: number,
  radiusKm: number = 0.5
): Promise<any[]> => {
  const incidents = await prisma.roadIncident.findMany({
    where: {
      status: IncidentStatus.ACTIVE,
      expiresAt: { gte: new Date() },
      latitude: {
        gte: lat - (radiusKm / EARTH_RADIUS_KM) * 180 / Math.PI,
        lte: lat + (radiusKm / EARTH_RADIUS_KM) * 180 / Math.PI,
      },
      longitude: {
        gte: lng - (radiusKm / EARTH_RADIUS_KM) * 180 / Math.PI / Math.cos(toRad(lat)),
        lte: lng + (radiusKm / EARTH_RADIUS_KM) * 180 / Math.PI / Math.cos(toRad(lat)),
      },
    },
    orderBy: { confidenceScore: 'desc' },
  });

  const grid: Record<string, any[]> = {};
  const gridSize = radiusKm / 3;

  incidents.forEach((incident) => {
    const gridLat = Math.floor(incident.latitude / gridSize);
    const gridLng = Math.floor(incident.longitude / (gridSize * Math.cos(toRad(incident.latitude))));
    const key = `${gridLat},${gridLng}`;

    if (!grid[key]) {
      grid[key] = [];
    }
    grid[key].push(incident);
  });

  const clusters: any[] = [];

  Object.entries(grid).forEach(([, cellIncidents]) => {
    if (cellIncidents.length === 0) return;

    const first = cellIncidents[0];
    const sameType = cellIncidents.filter((i) => i.type === first.type);

    if (sameType.length > 1) {
      const centerLat = sameType.reduce((sum, i) => sum + i.latitude, 0) / sameType.length;
      const centerLng = sameType.reduce((sum, i) => sum + i.longitude, 0) / sameType.length;

      clusters.push({
        type: 'cluster',
        clusterType: first.type,
        latitude: centerLat,
        longitude: centerLng,
        count: sameType.length,
        incidents: sameType.map((i) => i.id),
      });
    } else {
      cellIncidents.forEach((incident) => {
        clusters.push({
          type: 'incident',
          incidentId: incident.id,
          incidentType: incident.type,
          latitude: incident.latitude,
          longitude: incident.longitude,
          title: incident.title,
          confidenceScore: incident.confidenceScore,
        });
      });
    }
  });

  return clusters;
};

const expireOldIncidents = async (): Promise<number> => {
  const now = new Date();

  const result = await prisma.roadIncident.updateMany({
    where: {
      status: IncidentStatus.ACTIVE,
      expiresAt: { lt: now },
    },
    data: { status: IncidentStatus.EXPIRED },
  });

  if (result.count > 0) {
    logger.info(`Expired ${result.count} incident(s)`);
  }

  return result.count;
};

const getIncidentsInBounds = async (query: {
  neLat: string;
  neLng: string;
  swLat: string;
  swLng: string;
  type?: string;
}): Promise<any[]> => {
  const { neLat, neLng, swLat, swLng, type } = query;

  const where: any = {
    latitude: {
      gte: parseFloat(swLat),
      lte: parseFloat(neLat),
    },
    longitude: {
      gte: parseFloat(swLng),
      lte: parseFloat(neLng),
    },
    status: IncidentStatus.ACTIVE,
    expiresAt: { gte: new Date() },
  };

  if (type) {
    where.type = type;
  }

  const incidents = await prisma.roadIncident.findMany({
    where,
    orderBy: { confidenceScore: 'desc' },
    take: 500,
  });

  return incidents.map((i) => ({
    id: i.id,
    type: i.type,
    title: i.title,
    description: i.description,
    latitude: i.latitude,
    longitude: i.longitude,
    confidenceScore: i.confidenceScore,
    severity: i.severity,
    status: i.status,
    firstReportedAt: i.firstReportedAt,
    lastConfirmedAt: i.lastConfirmedAt,
  }));
};

export const IncidentService = {
  ALERT_DISTANCE_M: INCIDENT_ALERT_DISTANCE_M,
  createIncident,
  getNearbyIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
  confirmIncident,
  getConfirmations,
  getIncidentStats,
  clusterNearbyIncidents,
  expireOldIncidents,
  getIncidentsInBounds,
};
