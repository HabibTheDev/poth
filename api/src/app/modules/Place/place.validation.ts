import { z } from 'zod';

const searchPlacesSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query is required'),
    lat: z.string().optional(),
    lng: z.string().optional(),
    radius: z.string().optional(),
    type: z.string().optional(),
    limit: z.string().optional(),
  }),
});

const getNearbyPlacesSchema = z.object({
  query: z.object({
    lat: z.string().min(1, 'Latitude is required'),
    lng: z.string().min(1, 'Longitude is required'),
    radius: z.string().optional(),
    type: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const PlaceValidation = {
  searchPlacesSchema,
  getNearbyPlacesSchema,
};
