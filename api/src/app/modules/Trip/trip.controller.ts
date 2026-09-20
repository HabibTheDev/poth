import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { sendPaginatedResponse } from '../../utils/paginatedResponse';
import { TripService } from './trip.service';

const createTrip = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await TripService.createTrip(user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Trip started successfully',
    data: result,
  });
});

const getUserTrips = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await TripService.getUserTrips(user.userId, req.query as any);
  sendPaginatedResponse(res, httpStatus.OK, 'Trips retrieved successfully', result);
});

const getSingleTrip = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await TripService.getSingleTrip(req.params.id, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trip retrieved successfully',
    data: result,
  });
});

const completeTrip = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await TripService.completeTrip(req.params.id, user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trip completed successfully',
    data: result,
  });
});

const cancelTrip = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await TripService.cancelTrip(req.params.id, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trip cancelled successfully',
    data: result,
  });
});

const deleteTrip = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  await TripService.deleteTrip(req.params.id, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trip deleted successfully',
    data: null,
  });
});

const getTripStats = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const days = req.query.days ? parseInt(req.query.days as string) : 30;
  const result = await TripService.getTripStats(user.userId, days);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trip statistics retrieved successfully',
    data: result,
  });
});

export const TripController = {
  createTrip,
  getUserTrips,
  getSingleTrip,
  completeTrip,
  cancelTrip,
  deleteTrip,
  getTripStats,
};
