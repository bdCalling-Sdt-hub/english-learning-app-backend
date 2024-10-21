import express from 'express';
import auth from '../../middlewares/auth';
import { AdminTypes, USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { BannerController } from './banner.controller';
const router = express.Router();

router.post(
  '/add',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  fileUploadHandler(),
  BannerController.createBanner
);
router.delete(
  '/delete/:id',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  BannerController.deleteBanner
);
router.get('/', BannerController.getBanner);
router.get('/profile', BannerController.getProfileBanner);
router.get('/:id', BannerController.getBannerById);

export const BannerRoutes = router;
