import express from 'express';
import auth from '../../middlewares/auth';
import { AdminTypes, USER_ROLES } from '../../../enums/user';
import { InfoController } from './info.controller';
const router = express.Router();

router.patch(
  '/about',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  InfoController.updateAbout
);
router.patch(
  '/terms',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  InfoController.updateTerms
);
router.patch(
  '/privacy',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  InfoController.updatePrivacy
);
router.get('/about', InfoController.getAbout);
router.get('/terms', InfoController.getTerms);
router.get('/privacy', InfoController.getPrivacy);
router.get('/', InfoController.getAllInfos);
export const InfoRoutes = router;
