import httpStatus from 'http-status';
import { CommunityPost, PostComment, PostVisibility, ReactionType } from '@prisma/client';
import prisma from '../../database/prisma';
import AppError from '../../errors/AppError';

const createPost = async (userId: string, payload: {
  title: string;
  content: string;
  locationLat?: number;
  locationLng?: number;
  locationName?: string;
  visibility?: PostVisibility;
  tags?: string[];
}): Promise<CommunityPost> => {
  return prisma.communityPost.create({
    data: {
      ...payload,
      userId,
    },
  });
};

const getFeed = async (userId: string, query: {
  page?: string;
  limit?: string;
  visibility?: string;
  tag?: string;
}): Promise<any> => {
  const { page, limit, visibility, tag } = query;

  const where: any = {};

  if (visibility) {
    where.visibility = visibility;
  } else {
    where.visibility = PostVisibility.PUBLIC;
  }

  if (tag) {
    where.tags = { has: tag };
  }

  const take = Math.min(Number(limit) || 20, 50);
  const skip = ((Number(page) || 1) - 1) * take;

  const [data, total] = await Promise.all([
    prisma.communityPost.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, avatarUrl: true },
        },
      },
    }),
    prisma.communityPost.count({ where }),
  ]);

  return {
    data: data.map((post) => ({
      ...post,
      content: post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content,
    })),
    meta: {
      total,
      page: Number(page) || 1,
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
};

const getUserPosts = async (targetUserId: string, query: { page?: string; limit?: string }): Promise<any> => {
  const take = Math.min(Number(query.limit) || 20, 50);
  const skip = ((Number(query.page) || 1) - 1) * take;

  const [data, total] = await Promise.all([
    prisma.communityPost.findMany({
      where: { userId: targetUserId, visibility: PostVisibility.PUBLIC },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.communityPost.count({ where: { userId: targetUserId, visibility: PostVisibility.PUBLIC } }),
  ]);

  return {
    data,
    meta: {
      total,
      page: Number(query.page) || 1,
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
};

const getPostById = async (postId: string): Promise<any> => {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, avatarUrl: true },
      },
    },
  });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  await prisma.communityPost.update({
    where: { id: postId },
    data: { viewCount: { increment: 1 } },
  });

  return post;
};

const updatePost = async (postId: string, userId: string, payload: any): Promise<CommunityPost> => {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { id: true, userId: true },
  });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only update your own posts');
  }

  return prisma.communityPost.update({
    where: { id: postId },
    data: payload,
  });
};

const deletePost = async (postId: string, userId: string): Promise<void> => {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { id: true, userId: true },
  });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only delete your own posts');
  }

  await prisma.communityPost.delete({ where: { id: postId } });
};

const createComment = async (postId: string, userId: string, payload: {
  content: string;
  parentId?: string;
}): Promise<PostComment> => {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  const comment = await prisma.$transaction(async (tx) => {
    const newComment = await tx.postComment.create({
      data: {
        postId,
        userId,
        content: payload.content,
        parentId: payload.parentId,
      },
    });

    await tx.communityPost.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    return newComment;
  });

  const postAuthor = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { userId: true },
  });

  if (postAuthor) {
    await prisma.notification.create({
      data: {
        userId: postAuthor.userId!,
        title: 'New comment on your post',
        body: payload.content.substring(0, 100),
        type: 'POST_COMMENT',
        referenceId: postId,
      },
    });
  }

  return comment;
};

const getComments = async (postId: string, query: {
  page?: string;
  limit?: string;
}): Promise<any> => {
  const take = Math.min(Number(query.limit) || 20, 100);
  const skip = ((Number(query.page) || 1) - 1) * take;

  const [data, total] = await Promise.all([
    prisma.postComment.findMany({
      where: { postId, parentId: null },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, fullName: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
    prisma.postComment.count({ where: { postId, parentId: null } }),
  ]);

  return {
    data,
    meta: {
      total,
      page: Number(query.page) || 1,
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
};

const deleteComment = async (postId: string, commentId: string, userId: string): Promise<void> => {
  const comment = await prisma.postComment.findFirst({
    where: { id: commentId, postId },
    select: { id: true, userId: true, parentId: true },
  });

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  if (comment.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only delete your own comments');
  }

  await prisma.$transaction(async (tx) => {
    if (comment.parentId) {
      await tx.postComment.update({
        where: { id: comment.parentId },
        data: { ...comment.parentId ? {} : {} },
      });
    }
    await tx.postComment.delete({ where: { id: commentId } });
    await tx.communityPost.update({
      where: { id: postId },
      data: { commentCount: { decrement: 1 } },
    });
  });
};

const addReaction = async (postId: string, userId: string, reactionType: ReactionType): Promise<any> => {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  const existing = await prisma.postReaction.findUnique({
    where: { postId_userId_type: { postId, userId, type: reactionType } },
  });

  let result;
  if (existing) {
    await prisma.postReaction.delete({
      where: { postId_userId_type: { postId, userId, type: reactionType } },
    });
    result = { action: 'removed', type: reactionType };
  } else {
    await prisma.postReaction.create({
      data: { postId, userId, type: reactionType },
    });

    await prisma.communityPost.update({
      where: { id: postId },
      data: { reactionCount: { increment: 1 } },
    });

    const postAuthor = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    await prisma.notification.create({
      data: {
        userId: postAuthor!.userId,
        title: 'New reaction on your post',
        body: `Someone ${reactionType.toLowerCase()}d your post`,
        type: 'POST_REACTION',
        referenceId: postId,
      },
    });

    result = { action: 'added', type: reactionType };
  }

  const counts = await prisma.postReaction.groupBy({
    by: ['type'],
    where: { postId },
    _count: { type: true },
  });

  return {
    postId,
    action: result.action,
    type: result.type,
    counts: counts.reduce((acc: Record<string, number>, c) => {
      acc[c.type] = c._count.type;
      return acc;
    }, {}),
  };
};

const getUserReactions = async (userId: string, query: { page?: string; limit?: string }): Promise<any> => {
  const take = Math.min(Number(query.limit) || 20, 100);
  const skip = ((Number(query.page) || 1) - 1) * take;

  const [data, total] = await Promise.all([
    prisma.postReaction.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          select: { id: true, title: true, content: true },
        },
      },
    }),
    prisma.postReaction.count({ where: { userId } }),
  ]);

  return {
    data,
    meta: {
      total,
      page: Number(query.page) || 1,
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
};

export const CommunityService = {
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
