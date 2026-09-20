import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { VehicleService } from './vehicle.service';

const createVehicle = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await VehicleService.createVehicle(user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Vehicle created successfully',
    data: result,
  });
});

const getUserVehicles = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await VehicleService.getUserVehicles(user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vehicles retrieved successfully',
    data: result,
  });
});

const getSingleVehicle = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await VehicleService.getSingleVehicle(req.params.id, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vehicle retrieved successfully',
    data: result,
  });
});

const updateVehicle = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await VehicleService.updateVehicle(req.params.id, user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vehicle updated successfully',
    data: result,
  });
});

const deleteVehicle = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  await VehicleService.deleteVehicle(req.params.id, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vehicle deleted successfully',
    data: null,
  });
});

const setPrimary = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await VehicleService.setPrimary(req.params.id, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Primary vehicle set successfully',
    data: result,
  });
});

const addFuelEfficiency = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await VehicleService.addFuelEfficiency(req.params.id, user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Fuel efficiency added successfully',
    data: result,
  });
});

const getFuelEfficiencies = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await VehicleService.getFuelEfficiencies(req.params.id, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Fuel efficiencies retrieved successfully',
    data: result,
  });
});

export const VehicleController = {
  createVehicle,
  getUserVehicles,
  getSingleVehicle,
  updateVehicle,
  deleteVehicle,
  setPrimary,
  addFuelEfficiency,
  getFuelEfficiencies,
};
