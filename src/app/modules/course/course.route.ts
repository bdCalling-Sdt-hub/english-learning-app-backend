import express from 'express';
import { CourseController } from './course.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { CourseValidation } from './course.validation';
import { LectureRoutes } from './lecture/lecture.route';
import { EnrollmentRoutes } from './enrollment/enrollment.route';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router();

router
  .post(
    '/',
    auth(USER_ROLES.ADMIN, USER_ROLES.TEACHER),
    fileUploadHandler(),
    CourseController.createCourse
  )
  .get('/', CourseController.getAllCourses)
  .get('/:id', CourseController.getCourseById)
  .get('/teacher/:teacherID', CourseController.getCourseByTeacherId)
  .get('/:id/lectures', CourseController.getLecturesOfCourseByID)
  .patch(
    '/:id',
    auth(USER_ROLES.ADMIN, USER_ROLES.TEACHER),
    fileUploadHandler(),
    CourseController.updateCourse
  )
  .delete(
    '/:id',
    auth(USER_ROLES.ADMIN, USER_ROLES.TEACHER),
    CourseController.deleteCourse
  );
router.use('/lectures', LectureRoutes);
router.use('/enrollments', EnrollmentRoutes);
export const CourseRoutes = router;
