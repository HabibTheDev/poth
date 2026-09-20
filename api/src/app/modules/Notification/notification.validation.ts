import { z } from 'zod';

const createNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    body: z.string().min(1, 'Body is required').max(1000),
    type: z.enum([
      'INCIDENT_NEARBY',
      'INCIDENT_CONFIRMED',
      'INCIDENT_RESOLVED',
      'INCIDENT_EXPIRED',
      'COMMUNITY_POST',
      'POST_COMMENT',
      'POST_REACTION',
      'FUEL_ALERT',
      'RANGE_WARNING',
      'EMERGENCY_SOS',
      'SYSTEM',
    ]),
    referenceId: z.string().optional(),
    data: z.any().optional(),
  }),
});

const getNotificationsQuerySchema = z.object({
  query: z.object({
    isRead: z.string().optional(),
    type: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const NotificationValidation = {
  createNotificationSchema,
  getNotificationsQuerySchema,
};
