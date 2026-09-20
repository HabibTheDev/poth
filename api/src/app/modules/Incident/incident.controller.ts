import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { sendPaginatedResponse } from '../../utils/paginatedResponse';
import { IncidentService } from './incident.service';

const createIncident = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await IncidentService.createIncident(user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Incident reported successfully',
    data: result,
  });
});

const getNearbyIncidents = catchAsync(async (req: Request, res: Response) => {
  const result = await IncidentService.getNearbyIncidents(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Incidents retrieved successfully',
    data: result,
  });
});

const getIncidentsInBounds = catchAsync(async (req: Request, res: Response) => {
  const result = await IncidentService.getIncidentsInBounds(req.query as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Incidents retrieved successfully',
    data: result,
  });
});

const getIncidentById = catchAsync(async (req: Request, res: Response) => {
  const result = await IncidentService.getIncidentById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Incident retrieved successfully',
    data: result,
  });
});

const updateIncident = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string; role: string };
  const isModerator = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(user.role);
  const result = await IncidentService.updateIncident(req.params.id, user.userId, req.body, isModerator);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Incident updated successfully',
    data: result,
  });
});

const deleteIncident = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string; role: string };
  const isModerator = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(user.role);
  await IncidentService.deleteIncident(req.params.id, user.userId, isModerator);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Incident deleted successfully',
    data: null,
  });
});

const confirmIncident = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await IncidentService.confirmIncident(
    req.params.id,
    user.userId,
    req.body.vote || 'CONFIRM'
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Incident confirmation recorded',
    data: result,
  });
});

const getConfirmations = catchAsync(async (req: Request, res: Response) => {
  const result = await IncidentService.getConfirmations(req.params.id, req.query as any);
  sendPaginatedResponse(res, httpStatus.OK, 'Confirmations retrieved successfully', result);
});

const getIncidentStats = catchAsync(async (req: Request, res: Response) => {
  const result = await IncidentService.getIncidentStats(req.query as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Incident statistics retrieved successfully',
    data: result,
  });
});

const getClusters = catchAsync(async (req: Request, res: Response) => {
  const result = await IncidentService.clusterNearbyIncidents(
    parseFloat(req.query.lat as string),
    parseFloat(req.query.lng as string),
    parseFloat((req.query.radius || '5') as string)
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Incident clusters retrieved successfully',
    data: result,
  });
});

export const IncidentController = {
  createIncident,
  getNearbyIncidents,
  getIncidentsInBounds,
  getIncidentById,
  updateIncident,
  deleteIncident,
  confirmIncident,
  getConfirmations,
  getIncidentStats,
  getClusters,
};
