import express from 'express';
import { AdminTypes, USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { AdminController } from './admin.controller';

const router = express.Router();
router.post(
  '/super-admin',
  // auth(USER_ROLES.ADMIN),
  AdminController.createSuperAdmin
);
router.post('/', auth(AdminTypes.SUPERADMIN), AdminController.createAdmin);
router.get(
  '/profile',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  AdminController.getAdminProfile
);
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  AdminController.updateAdmin
);
router.get(
  '/status',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  AdminController.getWebSiteStatus
);
router.get(
  '/earnings',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  AdminController.getMonthlyEarning
);
router.get(
  '/',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  AdminController.getAllAdmins
);
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  AdminController.getAdminById
);

router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  AdminController.deleteAdmin
);
router.post(
  '/:adminId/create-appointed-teacher',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  AdminController.createAppointedTeacher
);
router.post(
  '/:adminId/make-teacher-appointed/:id',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  AdminController.makeTeacherAppointed
);
router.post(
  '/:adminId/make-teacher-unappointed/:id',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  AdminController.makeTeacherUnappointed
);
export const AdminRoutes = router;
