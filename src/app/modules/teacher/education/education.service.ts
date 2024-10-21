import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import { Teacher } from '../teacher.model';

const addEducationToDB = async (
  id: string,
  degree: string,
  institute: string
) => {
  if (!degree || !institute) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Degree and institute are required!'
    );
  }
  const teacher = await Teacher.findById(id);
  if (!teacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher not found!');
  }
  //@ts-ignore
  const educationID = teacher?.education?.length + 1;
  const result = await Teacher.findByIdAndUpdate(id, {
    $push: { education: { degree, institute, id: educationID } },
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Couldn't add education!");
  }
  return result;
};
const updateSpecificEducationToDB = async (
  teacherId: string,
  educationId: string,
  degree: string,
  institute: string
) => {
  const isExistTeacher = await Teacher.findById(teacherId);
  if (!isExistTeacher) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher not found!');
  }
  const result = await isExistTeacher?.education?.find(
    education => education.id === educationId
  );
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Education not found!');
  }
  result.degree = degree ?? result.degree;
  result.institute = institute ?? result.institute;
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Couldn't update education!");
  }
  return result;
};
const deleteSpecificEducationFromDB = async (
  teacherId: string,
  educationId: string
) => {
  const result = await Teacher.findByIdAndUpdate(teacherId, {
    $pull: { education: { id: educationId } },
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Couldn't delete education!");
  }
  return result;
};

export const EducationService = {
  addEducationToDB,
  updateSpecificEducationToDB,
  deleteSpecificEducationFromDB,
};
