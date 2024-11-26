import express from 'express';
import { filterController } from './filter.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
const router = express.Router();
router.get(
  '/freelancer',
  auth(USER_ROLES.STUDENT),
  filterController.getFreelancerCourses
);
router.get(
  '/platform',
  auth(USER_ROLES.STUDENT),
  filterController.getPlatformCourses
);
router.get('/gender/:gender', filterController.filterCourseByGender);
router.get('/date/:date', filterController.filterCourseByDate);
router.get('/rate', filterController.filterCourseByRate);
router.get('/search', filterController.filterCourseBySearch);
router.get('/teacher/:id', filterController.getTeacherCourses);
router.get('/my', auth(USER_ROLES.TEACHER), filterController.getMyCourses);
export const filterRoutes = router;
