import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { User } from '@prisma/client';
import prisma from '../../database/prisma';
import AppError from '../../errors/AppError';
import config from '../../config';
import { USER_CONSTANTS, USER_SELECT_SAFE } from './user.constant';
import { TUserRole } from '../../shared/user.types';

const isPasswordMatched = async (givenPassword: string, savedPassword: string): Promise<boolean> => {
  return bcrypt.compare(givenPassword, savedPassword);
};

const createUser = async (payload: {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  role?: TUserRole;
  status?: 'ACTIVE' | 'BLOCKED' | 'PENDING';
}): Promise<User> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, 'User with this email already exists');
  }

  if (payload.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone: payload.phone },
      select: { id: true },
    });
    if (existingPhone) {
      throw new AppError(httpStatus.CONFLICT, 'User with this phone number already exists');
    }
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  const user = await prisma.user.create({
    data: {
      email: payload.email,
      password: hashedPassword,
      fullName: payload.fullName,
      phone: payload.phone,
      role: payload.role ?? USER_CONSTANTS.DEFAULT_ROLE,
      status: payload.status ?? 'PENDING',
    },
  });

  return user;
};

const getAllUsers = async (query: Record<string, any>) => {
  const { searchTerm, role, status, ...filterData } = query;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: USER_CONSTANTS.searchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      })),
    });
  }

  if (role) {
    andConditions.push({ role: { in: Array.isArray(role) ? role : [role] } });
  }

  if (status) {
    andConditions.push({ status: { in: Array.isArray(status) ? status : [status] } });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: filterData[key] },
      })),
    });
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  const page = Number(query?.page) || 1;
  const limit = Math.min(Number(query?.limit) || 10, 100);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: query?.sort ? { [query.sort]: query.sort.startsWith('-') ? 'desc' : 'asc' } : { createdAt: 'desc' },
      select: USER_SELECT_SAFE,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

const getSingleUser = async (id: string): Promise<Omit<User, 'password'> | null> => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: USER_SELECT_SAFE,
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

const getMe = async (userId: string): Promise<Omit<User, 'password'> | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
    select: USER_SELECT_SAFE,
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

const updateUser = async (id: string, payload: {
  fullName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role?: TUserRole;
  status?: 'ACTIVE' | 'BLOCKED' | 'PENDING';
  isDeleted?: boolean;
}): Promise<Omit<User, 'password'> | null> => {
  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, isDeleted: true },
  });

  if (!existing || existing.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (payload.phone) {
    const duplicate = await prisma.user.findFirst({
      where: { phone: payload.phone, id: { not: id } },
      select: { id: true },
    });
    if (duplicate) {
      throw new AppError(httpStatus.CONFLICT, 'Phone number is already in use');
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: payload,
    select: USER_SELECT_SAFE,
  });

  return user;
};

const deleteUser = async (id: string): Promise<void> => {
  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, isDeleted: true },
  });

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (existing.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User is already deleted');
  }

  await prisma.user.update({
    where: { id },
    data: { isDeleted: true },
  });
};

const restoreUser = async (id: string): Promise<void> => {
  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, isDeleted: true },
  });

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!existing.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User is not deleted');
  }

  await prisma.user.update({
    where: { id },
    data: { isDeleted: false },
  });
};

const disableExpiredNeverLoggedInUsers = async (): Promise<number> => {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const result = await prisma.user.updateMany({
    where: {
      isDeleted: false,
      status: 'PENDING',
      lastLoginAt: null,
      createdAt: { lt: cutoff },
    },
    data: { status: 'BLOCKED' },
  });

  return result.count;
};

const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true, passwordChangedAt: true, isDeleted: true },
  });

  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!(await isPasswordMatched(oldPassword, user.password))) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      passwordChangedAt: new Date(),
      needsPasswordChange: false,
    },
  });
};

export const UserService = {
  createUser,
  getAllUsers,
  getSingleUser,
  getMe,
  updateUser,
  deleteUser,
  restoreUser,
  changePassword,
  disableExpiredNeverLoggedInUsers,
};
