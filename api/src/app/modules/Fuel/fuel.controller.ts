import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { sendPaginatedResponse } from '../../utils/paginatedResponse';
import { FuelService } from './fuel.service';

const createFuelRecord = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await FuelService.createFuelRecord(user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Fuel record created successfully',
    data: result,
  });
});

const getUserFuelRecords = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await FuelService.getUserFuelRecords(user.userId, req.query as any);
  sendPaginatedResponse(res, httpStatus.OK, 'Fuel records retrieved successfully', result);
});

const getSingleFuelRecord = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await FuelService.getSingleFuelRecord(req.params.id, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Fuel record retrieved successfully',
    data: result,
  });
});

const deleteFuelRecord = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  await FuelService.deleteFuelRecord(req.params.id, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Fuel record deleted successfully',
    data: null,
  });
});

const predictRange = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await FuelService.predictRange(user.userId, req.params.vehicleId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Range prediction retrieved successfully',
    data: result,
  });
});

const getFuelStats = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const vehicleId = req.query.vehicleId as string | undefined;
  const result = await FuelService.getFuelStats(user.userId, vehicleId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Fuel statistics retrieved successfully',
    data: result,
  });
});

export const FuelController = {
  createFuelRecord,
  getUserFuelRecords,
  getSingleFuelRecord,
  deleteFuelRecord,
  predictRange,
  getFuelStats,
};
