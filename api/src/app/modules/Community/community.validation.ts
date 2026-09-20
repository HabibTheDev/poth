import { z } from 'zod';

const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    content: z.string().min(1, 'Content is required').max(10000),
    locationLat: z.number().min(-90).max(90).optional(),
    locationLng: z.number().min(-180).max(180).optional(),
    locationName: z.string().max(200).optional(),
    visibility: z.enum(['PUBLIC', 'FOLLOWERS', 'PRIVATE']).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).max(10000).optional(),
    locationLat: z.number().min(-90).max(90).optional(),
    locationLng: z.number().min(-180).max(180).optional(),
    locationName: z.string().max(200).optional(),
    visibility: z.enum(['PUBLIC', 'FOLLOWERS', 'PRIVATE']).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment content is required').max(2000),
    parentId: z.string().optional(),
  }),
});

const addReactionSchema = z.object({
  body: z.object({
    type: z.enum(['LIKE', 'LOVE', 'INSIGHTFUL', 'LAUGH']).optional(),
  }),
});

const getPostsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    visibility: z.string().optional(),
    tag: z.string().optional(),
  }),
});

export const CommunityValidation = {
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
  addReactionSchema,
  getPostsQuerySchema,
};
