import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { NotificationValidation } from './notification.validation';
import { NotificationController } from './notification.controller';

const router = Router();

router.use(auth());

router.get('/', validateRequest(NotificationValidation.getNotificationsQuerySchema), NotificationController.getUserNotifications);
router.patch('/mark-all-read', NotificationController.markAllRead);
router.delete('/', NotificationController.deleteAllNotifications);
router.get('/:id', NotificationController.getNotificationById);
router.patch('/:id/read', NotificationController.markAsRead);
router.delete('/:id', NotificationController.deleteNotification);

export const NotificationRoutes = router;
