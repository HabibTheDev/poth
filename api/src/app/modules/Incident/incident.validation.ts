import { z } from 'zod';

const createIncidentSchema = z.object({
  body: z.object({
    type: z.enum([
      'TRAFFIC_JAM',
      'ACCIDENT',
      'POLICE',
      'ROAD_CLOSURE',
      'CONSTRUCTION',
      'POTHOLE',
      'BAD_ROAD',
      'WATERLOGGING',
      'BROKEN_SIGNAL',
      'TOLL',
      'HAZARD',
      'VEHICLE_BREAKDOWN',
      'FLOOD',
      'LANDSLIDE',
      'WEATHER',
    ]),
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(2000).optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  }),
});

const updateIncidentSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    status: z.enum(['ACTIVE', 'EXPIRED', 'RESOLVED', 'MODERATED']).optional(),
    moderationNotes: z.string().max(500).optional(),
  }),
});

const confirmIncidentSchema = z.object({
  body: z.object({
    vote: z.enum(['CONFIRM', 'SKEPTICAL', 'DISMISS']).optional(),
  }),
});

const getIncidentsQuerySchema = z.object({
  query: z.object({
    type: z.string().optional(),
    status: z.string().optional(),
    lat: z.string().optional(),
    lng: z.string().optional(),
    radius: z.string().optional(),
    limit: z.string().optional(),
    severity: z.string().optional(),
  }),
});

export const IncidentValidation = {
  createIncidentSchema,
  updateIncidentSchema,
  confirmIncidentSchema,
  getIncidentsQuerySchema,
};
