import express from 'express';
import { CourseController } from './course.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { CourseValidation } from './course.validation';
import { LectureRoutes } from './lecture/lecture.route';
import { EnrollmentRoutes } from './enrollment/enrollment.route';
import auth from '../../middlewares/auth';
import { AdminTypes, USER_ROLES } from '../../../enums/user';
import { filterRoutes } from './filter/filter.route';
const router = express.Router();
router
  .post(
    '',
    auth(USER_ROLES.TEACHER),
    fileUploadHandler(),
    CourseController.createCourse
  )
  .get('/', CourseController.getAllCourses)
  .get('/my', CourseController.getCourseByTeacherId)
  .get('/:id', CourseController.getCourseById)
  .get('/:id/details', CourseController.getCourseDetailsById)
  .get('/:id/lectures', CourseController.getLecturesOfCourseByID)
  .get('/language/:language', CourseController.getCourseByLanguage)

  .patch(
    '/:id',
    auth(USER_ROLES.TEACHER),
    fileUploadHandler(),
    CourseController.updateCourse
  )
  .patch(
    '/:id/approve',
    auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
    CourseController.approveCourse
  )
  .post(
    '/completed/:id',
    auth(USER_ROLES.TEACHER),
    CourseController.completeCourse
  );

router.use('/lectures', LectureRoutes);
router.use('/enrollments', EnrollmentRoutes);
router.use('/filters', filterRoutes);

export const CourseRoutes = router;
