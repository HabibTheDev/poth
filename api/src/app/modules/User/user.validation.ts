import { z } from 'zod';

const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters'),
    fullName: z.string().min(1, 'Full name is required').max(100).optional(),
    phone: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format')
      .optional(),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER']).optional(),
    status: z.enum(['ACTIVE', 'BLOCKED', 'PENDING']).optional(),
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(1).max(100).optional(),
    phone: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format')
      .optional()
      .nullable(),
    avatarUrl: z.string().url('Invalid URL format').optional().nullable(),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER']).optional(),
    status: z.enum(['ACTIVE', 'BLOCKED', 'PENDING']).optional(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(128, 'New password must be at most 128 characters'),
  }),
});

const blockUserSchema = z.object({
  body: z.object({
    reason: z.string().min(1, 'Reason is required').optional(),
  }),
});

export const UserValidation = {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  blockUserSchema,
};
