import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SeminarController } from './seminar.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { SeminarValidation } from './seminar.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.TEACHER),
  fileUploadHandler(),
  SeminarController.createSeminar
);
router.patch(
  '/:id',
  auth(USER_ROLES.TEACHER),
  fileUploadHandler(),
  validateRequest(SeminarValidation.updateSeminarZodSchema),
  SeminarController.updateSeminar
);
router.delete(
  '/:id',
  auth(USER_ROLES.TEACHER),
  SeminarController.deleteSeminar
);
router.get('/', SeminarController.getAllSeminar);
router.get('/:id', SeminarController.getSeminarById);
router.get('/teacher/:teacherID', SeminarController.getSeminarByTeacherId);

export const SeminarRoutes = router;
