import { StatusCodes } from 'http-status-codes';
import { Student } from '../app/modules/student/student.model';
import { Teacher } from '../app/modules/teacher/teacher.model';
import { USER_ROLES } from '../enums/user';
import ApiError from '../errors/ApiError';
import { IStudent } from '../app/modules/student/student.interface';
import { ITeacher } from '../app/modules/teacher/teacher.interface';

type UserModel = typeof Student | typeof Teacher;

export const getModelAccordingToRole = (
  existUser: IStudent | ITeacher
): UserModel => {
  let User: UserModel;

  if (existUser.role === USER_ROLES.TEACHER) {
    User = Teacher;
  } else if (existUser.role === USER_ROLES.STUDENT) {
    User = Student;
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User Role doesn't exist!");
  }

  return User;
};
