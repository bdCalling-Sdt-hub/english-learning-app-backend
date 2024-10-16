import express from 'express';
import auth from '../../middlewares/auth';
import { AdminTypes, USER_ROLES } from '../../../enums/user';
import { FaqController } from './faq.controller';
const router = express.Router();
router.post(
  '/add',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  FaqController.createFaq
);
router.patch(
  '/update/:id',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  FaqController.updateFaq
);
router.get('/get/:id', FaqController.getFaqById);
router.get('/get-all', FaqController.getAllFaqs);

router.delete(
  '/delete/:id',
  auth(USER_ROLES.ADMIN, AdminTypes.SUPERADMIN),
  FaqController.deleteFaq
);
export const FaqRoutes = router;
