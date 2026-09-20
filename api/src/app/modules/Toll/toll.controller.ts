import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { sendPaginatedResponse } from '../../utils/paginatedResponse';
import { TollPointService } from './toll.service';

const createTollPoint = catchAsync(async (req: Request, res: Response) => {
  const result = await TollPointService.createTollPoint(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Toll point created successfully',
    data: result,
  });
});

const getAllTollPoints = catchAsync(async (req: Request, res: Response) => {
  const result = await TollPointService.getAllTollPoints(req.query as any);
  sendPaginatedResponse(res, httpStatus.OK, 'Toll points retrieved successfully', result);
});

const getTollPointById = catchAsync(async (req: Request, res: Response) => {
  const result = await TollPointService.getTollPointById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Toll point retrieved successfully',
    data: result,
  });
});

const getTollsOnRoute = catchAsync(async (req: Request, res: Response) => {
  const result = await TollPointService.getTollsOnRoute(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tolls on route retrieved successfully',
    data: result,
  });
});

const updateTollPoint = catchAsync(async (req: Request, res: Response) => {
  const result = await TollPointService.updateTollPoint(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Toll point updated successfully',
    data: result,
  });
});

const deleteTollPoint = catchAsync(async (req: Request, res: Response) => {
  await TollPointService.deleteTollPoint(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Toll point deleted successfully',
    data: null,
  });
});

export const TollPointController = {
  createTollPoint,
  getAllTollPoints,
  getTollPointById,
  getTollsOnRoute,
  updateTollPoint,
  deleteTollPoint,
};
