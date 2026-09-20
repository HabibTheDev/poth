import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { CommunityValidation } from './community.validation';
import { CommunityController } from './community.controller';

const router = Router();

router.get('/feed', auth(), validateRequest(CommunityValidation.getPostsQuerySchema), CommunityController.getFeed);
router.get('/reactions', auth(), CommunityController.getUserReactions);
router.get('/user/:userId', CommunityController.getUserPosts);
router.get('/:postId/comments', CommunityController.getComments);
router.get('/:postId', CommunityController.getPostById);

router.use(auth());

router.post('/', validateRequest(CommunityValidation.createPostSchema), CommunityController.createPost);
router.patch('/:postId', validateRequest(CommunityValidation.updatePostSchema), CommunityController.updatePost);
router.delete('/:postId', CommunityController.deletePost);
router.post('/:postId/comments', validateRequest(CommunityValidation.createCommentSchema), CommunityController.createComment);
router.delete('/:postId/comments/:commentId', CommunityController.deleteComment);
router.post('/:postId/reactions', validateRequest(CommunityValidation.addReactionSchema), CommunityController.addReaction);

export const CommunityRoutes = router;
