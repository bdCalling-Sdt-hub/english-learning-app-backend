import { status } from '../enums/user';

export const isStudentDeleted = (student: any) => {
  if (student) {
    if (student.status === status.delete) {
      return true;
    }
    return false;
  }
  return false;
};
