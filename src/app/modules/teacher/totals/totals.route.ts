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
export const totalsRoutes = router;
