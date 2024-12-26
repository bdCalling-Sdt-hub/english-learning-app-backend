import express from 'express';
import { EnrollmentController } from './enrollment.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { EnrollmentValidation } from './enrollment.validation';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';
import { CourseController } from '../course.controller';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.STUDENT),
  validateRequest(EnrollmentValidation.createEnrollmentZodSchema),
  EnrollmentController.createEnrollment
);

router.post(
  '/create-payment-intent',
  auth(USER_ROLES.STUDENT),
  EnrollmentController.createPaymentIntent
);

router.get(
  '/enrolled',
  auth(USER_ROLES.STUDENT),
  CourseController.getEnrolledCourses
);
router.get(
  '/isenrolled/:id',
  auth(USER_ROLES.STUDENT),
  EnrollmentController.isEnrolled
);
export const EnrollmentRoutes = router;
