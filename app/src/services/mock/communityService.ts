import { CommunityService } from '../types';
import { mockPosts, mockComments } from '@/mocks/dhaka';
import { CommunityPost, Comment } from '@/types/domain';
import { delay, uid } from './util';

let posts: CommunityPost[] = [...mockPosts];
let comments: Comment[] = [...mockComments];

export const mockCommunityService: CommunityService = {
  async listPosts() {
    return delay([...posts].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)), 450);
  },

  async getPost(id) {
    return delay(posts.find((p) => p.id === id) ?? null, 300);
  },

  async listComments(postId) {
    return delay(comments.filter((c) => c.postId === postId), 350);
  },

  async addComment(postId, body) {
    const comment: Comment = {
      id: uid('cm'),
      postId,
      authorId: 'u1',
      authorName: 'You',
      body,
      createdAt: new Date().toISOString(),
    };
    comments = [...comments, comment];
    posts = posts.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p));
    return delay(comment, 400);
  },

  async createPost({ title, body }) {
    const post: CommunityPost = {
      id: uid('c'),
      authorId: 'u1',
      authorName: 'You',
      authorReputation: 82,
      title,
      body,
      createdAt: new Date().toISOString(),
      reactionCount: 0,
      commentCount: 0,
    };
    posts = [post, ...posts];
    return delay(post, 500);
  },
};
