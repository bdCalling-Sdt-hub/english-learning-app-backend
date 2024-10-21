import { StatusCodes } from 'http-status-codes';
import { Teacher } from '../teacher.model';
import ApiError from '../../../../errors/ApiError';
const addSkillToDB = async (id: string, skill: string | string[]) => {
  if (!id) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Teacher id is required');
  }
  const isExistTeacher = await Teacher.findById(id);
  if (!isExistTeacher) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Teacher not found');
  }
  if (Array.isArray(skill)) {
    const result = await Teacher.findByIdAndUpdate(id, {
      $addToSet: { skills: { $each: skill } },
    });
    return result;
  }
  const result = await Teacher.findByIdAndUpdate(id, {
    $push: { skills: skill },
  });
  return result;
};

const removeSkillFromDB = async (teacherId: string, skill: string) => {
  const result = await Teacher.findByIdAndUpdate(teacherId, {
    $pull: { skills: skill },
  });
  return result;
};

export const SkillsService = { addSkillToDB, removeSkillFromDB };
