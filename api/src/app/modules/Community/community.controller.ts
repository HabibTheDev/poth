import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { sendPaginatedResponse } from '../../utils/paginatedResponse';
import { CommunityService } from './community.service';

const createPost = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await CommunityService.createPost(user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Post created successfully',
    data: result,
  });
});

const getFeed = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await CommunityService.getFeed(user.userId, req.query as any);
  sendPaginatedResponse(res, httpStatus.OK, 'Feed retrieved successfully', result);
});

const getUserPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await CommunityService.getUserPosts(req.params.userId, req.query as any);
  sendPaginatedResponse(res, httpStatus.OK, 'User posts retrieved successfully', result);
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
  const result = await CommunityService.getPostById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post retrieved successfully',
    data: result,
  });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await CommunityService.updatePost(req.params.id, user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post updated successfully',
    data: result,
  });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  await CommunityService.deletePost(req.params.id, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post deleted successfully',
    data: null,
  });
});

const createComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await CommunityService.createComment(req.params.postId, user.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Comment added successfully',
    data: result,
  });
});

const getComments = catchAsync(async (req: Request, res: Response) => {
  const result = await CommunityService.getComments(req.params.postId, req.query as any);
  sendPaginatedResponse(res, httpStatus.OK, 'Comments retrieved successfully', result);
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  await CommunityService.deleteComment(req.params.postId, req.params.commentId, user.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment deleted successfully',
    data: null,
  });
});

const addReaction = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await CommunityService.addReaction(
    req.params.postId,
    user.userId,
    (req.body.type || 'LIKE') as any
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reaction updated successfully',
    data: result,
  });
});

const getUserReactions = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { userId: string };
  const result = await CommunityService.getUserReactions(user.userId, req.query as any);
  sendPaginatedResponse(res, httpStatus.OK, 'Reactions retrieved successfully', result);
});

export const CommunityController = {
  createPost,
  getFeed,
  getUserPosts,
  getPostById,
  updatePost,
  deletePost,
  createComment,
  getComments,
  deleteComment,
  addReaction,
  getUserReactions,
};
