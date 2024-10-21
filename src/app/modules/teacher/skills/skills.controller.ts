import { Request, Response } from 'express';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { SkillsService } from './skills.service';

const addSkill = catchAsync(async (req: Request, res: Response) => {
  const { skill } = req.body;
  const { id } = req.user;
  const result = await SkillsService.addSkillToDB(id, skill);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Skill added successfully',
    data: result,
  });
});

const removeSkill = catchAsync(async (req: Request, res: Response) => {
  const { skill } = req.params;
  const { id: teacherId } = req.user;
  const result = await SkillsService.removeSkillFromDB(teacherId, skill);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Skill removed successfully',
    data: result,
  });
});

export const SkillsController = { addSkill, removeSkill };
