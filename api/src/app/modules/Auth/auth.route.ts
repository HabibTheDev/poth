import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { AuthValidation } from './auth.validation';
import { AuthController } from './auth.controller';
import { UserValidation } from '../User/user.validation';
import { UserController } from '../User/user.controller';

const router = Router();

router.post(
  '/register',
  validateRequest(AuthValidation.registerSchema),
  AuthController.register
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginSchema),
  AuthController.login
);

router.post('/refresh-token', AuthController.refreshToken);

router.post('/logout', auth(), AuthController.logout);

router.post(
  '/forgot-password',
  validateRequest(AuthValidation.forgotPasswordSchema),
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordSchema),
  AuthController.resetPassword
);

router.patch(
  '/change-password',
  auth(),
  validateRequest(UserValidation.changePasswordSchema),
  UserController.changePassword
);

export const AuthRoutes = router;
