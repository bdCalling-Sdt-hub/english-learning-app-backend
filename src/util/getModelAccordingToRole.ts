import { StatusCodes } from 'http-status-codes';
import { Student } from '../app/modules/student/student.model';
import { Teacher } from '../app/modules/teacher/teacher.model';
import { USER_ROLES } from '../enums/user';
import ApiError from '../errors/ApiError';
import { IStudent } from '../app/modules/student/student.interface';
import { ITeacher } from '../app/modules/teacher/teacher.interface';
import { AdminModel, IAdmin } from '../app/modules/admin/admin.interface';
import { Admin } from '../app/modules/admin/admin.model';

type UserModel = typeof Student | typeof Teacher;

export const getModelAccordingToRole = (
  existUser: IStudent | ITeacher | IAdmin
): UserModel => {
  let User: any;

  if (existUser.role === USER_ROLES.TEACHER) {
    User = Teacher;
  } else if (existUser.role === USER_ROLES.STUDENT) {
    User = Student;
  } else if (existUser.role === USER_ROLES.ADMIN) {
    User = Admin;
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User Role doesn't exist!");
  }

  return User;
};
