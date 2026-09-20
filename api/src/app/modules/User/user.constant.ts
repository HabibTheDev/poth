import { TUserRole } from '../../shared/user.types';

export type { TUserRole };

export const USER_CONSTANTS = {
  ROLES: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'] as TUserRole[],
  DEFAULT_ROLE: 'USER' as TUserRole,
  STATUS: ['ACTIVE', 'BLOCKED', 'PENDING'] as const,
  DEFAULT_STATUS: 'PENDING' as const,
  searchableFields: ['email', 'fullName', 'phone'],
} as const;

export const USER_SELECT_SAFE = {
  id: true,
  email: true,
  phone: true,
  fullName: true,
  role: true,
  status: true,
  avatarUrl: true,
  lastLoginAt: true,
  isDeleted: true,
  needsPasswordChange: true,
  passwordChangedAt: true,
  phoneVerifiedAt: true,
  emailVerifiedAt: true,
  resetCode: true,
  resetCodeExpiry: true,
  createdAt: true,
  updatedAt: true,
};
