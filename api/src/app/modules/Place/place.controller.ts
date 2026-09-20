import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PlaceService } from './place.service';

const searchPlaces = catchAsync(async (req: Request, res: Response) => {
  const result = await PlaceService.searchPlaces(req.query as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Places found',
    data: result,
  });
});

const getNearbyPlaces = catchAsync(async (req: Request, res: Response) => {
  const result = await PlaceService.getNearbyPlaces(req.query as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Nearby places retrieved',
    data: result,
  });
});

const getPlaceById = catchAsync(async (req: Request, res: Response) => {
  const result = await PlaceService.getPlaceById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Place retrieved successfully',
    data: result,
  });
});

const createPlace = catchAsync(async (req: Request, res: Response) => {
  const result = await PlaceService.createPlace(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Place created successfully',
    data: result,
  });
});

const updatePlace = catchAsync(async (req: Request, res: Response) => {
  const result = await PlaceService.updatePlace(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Place updated successfully',
    data: result,
  });
});

const deletePlace = catchAsync(async (req: Request, res: Response) => {
  await PlaceService.deletePlace(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Place deleted successfully',
    data: null,
  });
});

export const PlaceController = {
  searchPlaces,
  getNearbyPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
};
