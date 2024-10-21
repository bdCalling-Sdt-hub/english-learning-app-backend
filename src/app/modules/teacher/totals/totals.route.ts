import express from 'express';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';
import { totalController } from './total.controller';
const router = express.Router();
router.get(
  '/status',
  auth(USER_ROLES.TEACHER),
  totalController.getOverallRating
);
router.get('/earnings', auth(USER_ROLES.TEACHER), totalController.getEarnings);
router.get(
  '/course-status',
  auth(USER_ROLES.TEACHER),
  totalController.getCourseStatus
);
export const totalsRoutes = router;
