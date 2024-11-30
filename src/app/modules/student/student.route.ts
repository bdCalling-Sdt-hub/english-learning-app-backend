import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { StudentController } from './student.controller';
import { StudentValidation } from './student.validation';
import { WishlistRoutes } from './wishlist/wishlist.route';
const router = express.Router();

router
  .get('/', StudentController.getAllStudents)
  .get(
    '/profile',
    auth(USER_ROLES.STUDENT),
    StudentController.getStudentProfile
  )

  .get('/:id', StudentController.getStudentById)
  .patch(
    '/',
    auth(USER_ROLES.STUDENT),
    fileUploadHandler(),
    StudentController.updateProfile
  )
  .delete('/', auth(USER_ROLES.STUDENT), StudentController.deleteStudent);
router.post('/banner/select', StudentController.selectBannerByID);

router
  .route('/')
  .post(
    validateRequest(StudentValidation.createStudentZodSchema),
    StudentController.createStudent
  );

router.use('/wishlist', WishlistRoutes);
export const StudentRoutes = router;
