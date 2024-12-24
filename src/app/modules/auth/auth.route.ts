import express from 'express';
import { AdminTypes, USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
const router = express.Router();

router.post(
  '/login',
  validateRequest(AuthValidation.createLoginZodSchema),
  AuthController.loginUser
);

router.post(
  '/forget-password',
  validateRequest(AuthValidation.createForgetPasswordZodSchema),
  AuthController.forgetPassword
);
router.post('/resend-verify-email', AuthController.resendEmail);
router.post(
  '/verify-email',
  validateRequest(AuthValidation.createVerifyEmailZodSchema),
  AuthController.verifyEmail
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.createResetPasswordZodSchema),
  AuthController.resetPassword
);

router.post(
  '/change-password',
  auth(
    USER_ROLES.ADMIN,
    AdminTypes.SUPERADMIN,
    USER_ROLES.STUDENT,
    USER_ROLES.TEACHER
  ),
  validateRequest(AuthValidation.createChangePasswordZodSchema),
  AuthController.changePassword
);
router.post('/social-login', AuthController.socialLogin);
export const AuthRoutes = router;
