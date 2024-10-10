import { StatusCodes } from 'http-status-codes';
import { IStudent } from '../app/modules/student/student.interface';
import { Student } from '../app/modules/student/student.model';
import { ITeacher } from '../app/modules/teacher/teacher.interface';
import { Teacher } from '../app/modules/teacher/teacher.model';
import ApiError from '../errors/ApiError';
import { Admin } from '../app/modules/admin/admin.model';
// first we define a variable called existUser it's initially null then we start checking if there is any user with that email if it doesn't we check if there is any teacher with that email if it doesn't exist we throw an error and if anything exist using this email we store that in existUser and continue the process with exist user
export const findInStudentAndTeacher = async (
  email: string,
  selectItem = ''
) => {
  let existUser = null;
  const isExistAdmin = await Admin.findOne({ email }).select(`+${selectItem}`);
  if (!isExistAdmin) {
    const isExistTeracher = await Teacher.findOne({ email }).select(
      `+${selectItem}`
    );

    if (!isExistTeracher) {
      const isExistUser = await Student.findOne({ email }).select(
        `+${selectItem}`
      );

      if (isExistUser) {
        existUser = isExistUser;
      } else {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
      }
    } else {
      existUser = isExistTeracher;
    }
  } else {
    existUser = isExistAdmin;
  }
  return existUser;
};
