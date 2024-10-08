import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { TeacherController } from './teacher.controller';
import { TeacherValidation } from './teacher.validation';
const router = express.Router();
router
  .get(
    '/profile',
    auth(USER_ROLES.ADMIN, USER_ROLES.TEACHER),
    TeacherController.getTeacherProfile
  )
  .get('/all', TeacherController.getAllTeachers)
  .get('/:id', TeacherController.getTeacherById)
  .post(
    '/payment-account-setup',
    validateRequest(TeacherValidation.createStripeAccountZodSchema),
    TeacherController.setUpTeacherPayment
  )
  .patch(
    '/:id',
    auth(USER_ROLES.ADMIN, USER_ROLES.TEACHER),
    validateRequest(TeacherValidation.updateTeacherZodSchema),
    fileUploadHandler(),
    TeacherController.updateProfile
  )
  .delete(
    '/:id',
    auth(USER_ROLES.ADMIN, USER_ROLES.TEACHER),
    TeacherController.deleteTeacher
  )
  .route('/')
  .post(TeacherController.createTeacher)
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.TEACHER),
    fileUploadHandler(),
    TeacherController.updateProfile
  );

export const TeacherRoutes = router;
