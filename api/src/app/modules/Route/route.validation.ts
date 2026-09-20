import { z } from 'zod';

const createSavedRouteSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Route name is required').max(100).optional(),
    originLat: z.number().min(-90).max(90),
    originLng: z.number().min(-180).max(180),
    originName: z.string().optional(),
    destLat: z.number().min(-90).max(90),
    destLng: z.number().min(-180).max(180),
    destName: z.string().optional(),
    waypoints: z.array(z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      name: z.string().optional(),
    })).optional(),
    vehicleId: z.string().optional(),
    distance: z.number().positive().optional(),
    duration: z.number().positive().optional(),
    routeData: z.any().optional(),
    isFavorite: z.boolean().optional(),
  }),
});

const updateSavedRouteSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    vehicleId: z.string().optional().nullable(),
    isFavorite: z.boolean().optional(),
  }),
});

const searchRoutesQuerySchema = z.object({
  query: z.object({
    isFavorite: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const SavedRouteValidation = {
  createSavedRouteSchema,
  updateSavedRouteSchema,
  searchRoutesQuerySchema,
};
