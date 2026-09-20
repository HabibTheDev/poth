import httpStatus from 'http-status';
import { Notification, NotificationType } from '@prisma/client';
import prisma from '../../database/prisma';
import AppError from '../../errors/AppError';
import logger from '../../utils/logger';

const createNotification = async (payload: {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  referenceId?: string;
  data?: any;
}): Promise<Notification> => {
  return prisma.notification.create({
    data: payload,
  });
};

const getUserNotifications = async (userId: string, query: {
  isRead?: string;
  type?: string;
  page?: string;
  limit?: string;
}): Promise<any> => {
  const { isRead, type, page, limit } = query;

  const where: any = { userId };

  if (isRead !== undefined) {
    where.isRead = isRead === 'true';
  }

  if (type) {
    where.type = type;
  }

  const take = Math.min(Number(limit) || 20, 100);
  const skip = ((Number(page) || 1) - 1) * take;

  const [data, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    data,
    meta: {
      total,
      unreadCount,
      page: Number(page) || 1,
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
};

const getNotificationById = async (id: string, userId: string): Promise<Notification | null> => {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  await prisma.notification.update({
    where: { id },
    data: { isRead: true, readAt: new Date() },
  });

  return notification;
};

const markAllRead = async (userId: string): Promise<void> => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
};

const markAsRead = async (id: string, userId: string): Promise<Notification> => {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
    select: { id: true, isRead: true },
  });

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  return prisma.notification.update({
    where: { id },
    data: { isRead: true, readAt: new Date() },
  });
};

const deleteNotification = async (id: string, userId: string): Promise<void> => {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  await prisma.notification.delete({ where: { id } });
};

const deleteAllNotifications = async (userId: string, type?: string): Promise<number> => {
  const where: any = { userId };
  if (type) where.type = type;

  const result = await prisma.notification.deleteMany({ where });
  return result.count;
};

const cleanupOldNotifications = async (daysOld: number = 90): Promise<number> => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);

  const result = await prisma.notification.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  if (result.count > 0) {
    logger.info(`Cleaned up ${result.count} old notification(s)`);
  }

  return result.count;
};

export const NotificationService = {
  createNotification,
  getUserNotifications,
  getNotificationById,
  markAllRead,
  markAsRead,
  deleteNotification,
  deleteAllNotifications,
  cleanupOldNotifications,
};
