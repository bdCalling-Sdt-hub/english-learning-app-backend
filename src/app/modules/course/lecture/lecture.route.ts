import express from 'express';
import { LectureController } from './lecture.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { LectureValidation } from './lecture.validation';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';
const router = express.Router();

router
  .get('/:id', LectureController.getLectureByID)
  .post(
    '/',
    auth(USER_ROLES.ADMIN, USER_ROLES.TEACHER),
    validateRequest(LectureValidation.createLectureZodSchema),
    LectureController.createLecture
  )
  .patch(
    '/:id',
    auth(USER_ROLES.ADMIN, USER_ROLES.TEACHER),
    validateRequest(LectureValidation.updateLectureZodSchema),
    LectureController.updateLecture
  )
  .delete(
    '/:id',
    auth(USER_ROLES.ADMIN, USER_ROLES.TEACHER),
    LectureController.deleteLecture
  );

export const LectureRoutes = router;
