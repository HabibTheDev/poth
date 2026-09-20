import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { UserValidation } from './user.validation';
import { UserController } from './user.controller';

const router = Router();

router.post(
  '/',
  auth('SUPER_ADMIN', 'ADMIN'),
  validateRequest(UserValidation.createUserSchema),
  UserController.createUser
);

router.get(
  '/me',
  auth(),
  UserController.getMe
);

router.get(
  '/',
  auth('SUPER_ADMIN', 'ADMIN'),
  UserController.getAllUsers
);

router.get(
  '/:id',
  auth(),
  UserController.getSingleUser
);

router.patch(
  '/change-password',
  auth(),
  validateRequest(UserValidation.changePasswordSchema),
  UserController.changePassword
);

router.patch(
  '/:id',
  auth('SUPER_ADMIN', 'ADMIN'),
  validateRequest(UserValidation.updateUserSchema),
  UserController.updateUser
);

router.delete(
  '/:id',
  auth('SUPER_ADMIN', 'ADMIN'),
  UserController.deleteUser
);

router.patch(
  '/:id/restore',
  auth('SUPER_ADMIN', 'ADMIN'),
  UserController.restoreUser
);

export const UserRoutes = router;
