import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { TeacherController } from './teacher.controller';
import { TeacherValidation } from './teacher.validation';
import { totalsRoutes } from './totals/totals.route';
import { SkillsRoutes } from './skills/skills.route';
const router = express.Router();
router
  .get(
    '/profile',
    auth(USER_ROLES.TEACHER),
    TeacherController.getTeacherProfile
  )
  .get('/all', TeacherController.getAllTeachers)
  .get('/:id', TeacherController.getTeacherById)
  .post(
    '/payment-account-setup',
    auth(USER_ROLES.TEACHER),
    fileUploadHandler(),
    TeacherController.setUpTeacherPayment
  )
  .get('/language/:language', TeacherController.getTeachersByLanguage)
  .patch(
    '/:id',
    auth(USER_ROLES.TEACHER),
    fileUploadHandler(),
    TeacherController.updateProfile
  )
  .patch(
    '/',
    auth(USER_ROLES.TEACHER),
    fileUploadHandler(),
    TeacherController.updateProfile
  )
  .delete('/:id', auth(USER_ROLES.ADMIN), TeacherController.deleteTeacher)
  .route('/')
  .post(
    validateRequest(TeacherValidation.createTeacherZodSchema),
    TeacherController.createTeacher
  );
router.use('/total', totalsRoutes);
router.use('/skills', auth(USER_ROLES.TEACHER), SkillsRoutes);
export const TeacherRoutes = router;
