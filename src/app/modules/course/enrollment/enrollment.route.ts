import express from 'express';
import { EnrollmentController } from './enrollment.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { EnrollmentValidation } from './enrollment.validation';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';

const router = express.Router();

router.post(
  '/',
  // auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
  validateRequest(EnrollmentValidation.createEnrollmentZodSchema),
  EnrollmentController.createEnrollment
);

export const EnrollmentRoutes = router;
