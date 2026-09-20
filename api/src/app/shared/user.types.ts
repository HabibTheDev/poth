import { JwtPayload } from 'jsonwebtoken';
import { User, UserStatus } from '@prisma/client';

export type TUserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'USER';

export type TUserRoleValue = TUserRole;

export const USER_ROLES: TUserRole[] = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'USER'];

export const USER_ROLES_ENUM = USER_ROLES as [string, ...string[]];

export interface IUser {
  id: string;
  email: string;
  phone?: string | null;
  fullName?: string | null;
  role: TUserRole;
  status: UserStatus;
  avatarUrl?: string | null;
  lastLoginAt?: Date | null;
}

export interface IUserSafe {
  id: string;
  email: string;
  phone?: string | null;
  fullName?: string | null;
  role: TUserRole;
  status: UserStatus;
  avatarUrl?: string | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthRequest extends JwtPayload {
  userId: string;
  role: TUserRole;
  email?: string;
}

export function safeUser(user: User): IUserSafe {
  const { password: _password, ...safe } = user as User & { password: string };
  return safe as unknown as IUserSafe;
}
