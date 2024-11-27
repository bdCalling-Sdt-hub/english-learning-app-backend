import { Router } from 'express';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';
import { StudentController } from '../student.controller';
const router = Router();

router.get('/getall', auth(USER_ROLES.STUDENT), StudentController.getWishlist);
router.post('/add', auth(USER_ROLES.STUDENT), StudentController.addToWishlist);
router.post(
  '/remove',
  auth(USER_ROLES.STUDENT),
  StudentController.removeFromWishlist
);
export const WishlistRoutes = router;
