import express from 'express';
import { ComplainController } from './complain.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();
router.post('/', auth(USER_ROLES.STUDENT), ComplainController.createComplain);
router.get('/:id', ComplainController.getComplainById);
router.get('/', ComplainController.getAllComplains);
router.get(
  '/teacher/enrolled/',
  auth(USER_ROLES.STUDENT),
  ComplainController.getEnrolledTeachers
);

export const ComplainRoutes = router;
