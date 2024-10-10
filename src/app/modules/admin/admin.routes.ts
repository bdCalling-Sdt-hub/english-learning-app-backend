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
router.patch('/:id', auth(USER_ROLES.ADMIN), AdminController.updateAdmin);
router.get('/', auth(USER_ROLES.ADMIN), AdminController.getAllAdmins);
router.get('/:id', auth(USER_ROLES.ADMIN), AdminController.getAdminById);
router.delete('/:id', auth(USER_ROLES.ADMIN), AdminController.deleteAdmin);

export const AdminRoutes = router;
