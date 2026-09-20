import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { sendPaginatedResponse } from '../../utils/paginatedResponse';
import { NotificationService } from './notification.service';

const createNotification = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationService.createNotification(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Notification sent successfully',
    data: result,
  });
});

const getUserNotifications = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await NotificationService.getUserNotifications(user.userId, req.query as any);
  sendPaginatedResponse(res, httpStatus.OK, 'Notifications retrieved successfully', result);
});

const getNotificationById = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await NotificationService.getNotificationById(req.params.id, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification retrieved successfully',
    data: result,
  });
});

const markAllRead = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  await NotificationService.markAllRead(user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All notifications marked as read',
    data: null,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await NotificationService.markAsRead(req.params.id, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification marked as read',
    data: result,
  });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  await NotificationService.deleteNotification(req.params.id, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification deleted successfully',
    data: null,
  });
});

const deleteAllNotifications = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const count = await NotificationService.deleteAllNotifications(user.userId, req.query.type as string | undefined);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${count} notification(s) deleted`,
    data: { deletedCount: count },
  });
});

export const NotificationController = {
  createNotification,
  getUserNotifications,
  getNotificationById,
  markAllRead,
  markAsRead,
  deleteNotification,
  deleteAllNotifications,
};
