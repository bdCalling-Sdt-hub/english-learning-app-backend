import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { StudentController } from './student.controller';
import { StudentValidation } from './student.validation';
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
    '/:id',
    auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
    fileUploadHandler(),
    StudentController.updateProfile
  )
  .delete(
    '/:id',
    auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
    StudentController.deleteStudent
  )
  .route('/')
  .post(
    validateRequest(StudentValidation.createStudentZodSchema),
    StudentController.createStudent
  )
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.STUDENT),
    fileUploadHandler(),
    StudentController.updateProfile
  );
router
  .post(
    '/wishlist/add',
    auth(USER_ROLES.STUDENT),
    StudentController.addToWishlist
  )
  .post(
    '/wishlist/remove',
    auth(USER_ROLES.STUDENT),
    StudentController.removeFromWishlist
  );

export const StudentRoutes = router;
