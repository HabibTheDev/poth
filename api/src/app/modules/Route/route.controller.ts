import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { sendPaginatedResponse } from '../../utils/paginatedResponse';
import { SavedRouteService } from './route.service';

const createSavedRoute = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await SavedRouteService.createSavedRoute(user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Route saved successfully',
    data: result,
  });
});

const getUserRoutes = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await SavedRouteService.getUserRoutes(user.userId, req.query as any);
  sendPaginatedResponse(res, httpStatus.OK, 'Routes retrieved successfully', result);
});

const getSingleRoute = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await SavedRouteService.getSingleRoute(req.params.id, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Route retrieved successfully',
    data: result,
  });
});

const updateSavedRoute = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await SavedRouteService.updateSavedRoute(req.params.id, user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Route updated successfully',
    data: result,
  });
});

const deleteSavedRoute = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  await SavedRouteService.deleteSavedRoute(req.params.id, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Route deleted successfully',
    data: null,
  });
});

const toggleFavorite = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await SavedRouteService.toggleFavorite(req.params.id, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Route favorite status toggled',
    data: result,
  });
});

export const SavedRouteController = {
  createSavedRoute,
  getUserRoutes,
  getSingleRoute,
  updateSavedRoute,
  deleteSavedRoute,
  toggleFavorite,
};
