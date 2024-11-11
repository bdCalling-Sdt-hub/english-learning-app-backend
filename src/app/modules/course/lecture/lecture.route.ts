import express from 'express';
import { LectureController } from './lecture.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { LectureValidation } from './lecture.validation';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';
const router = express.Router();

router
  .get(
    '/upcoming',
    auth(USER_ROLES.TEACHER),
    LectureController.getUpcomingLecture
  )
  .patch('/update-link', LectureController.updateLectureLink)
  .get('/:id', LectureController.getLectureByID)
  .post(
    '/',
    auth(USER_ROLES.TEACHER),
    validateRequest(LectureValidation.createLectureZodSchema),
    LectureController.createLecture
  )
  .patch(
    '/:id',
    auth(USER_ROLES.TEACHER),
    validateRequest(LectureValidation.updateLectureZodSchema),
    LectureController.updateLecture
  )
  .patch(
    '/:id/complete',
    auth(USER_ROLES.TEACHER),
    LectureController.completeLecture
  )
  .delete('/:id', auth(USER_ROLES.TEACHER), LectureController.deleteLecture);

export const LectureRoutes = router;
