import { Request, Response } from 'express';
import catchAsync from '../../../../shared/catchAsync';

import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../../shared/sendResponse';
import { EducationService } from './education.service';

const addEducation = catchAsync(async (req: Request, res: Response) => {
  const { degree, institute } = req.body;
  const { id } = req.user;
  const result = await EducationService.addEducationToDB(id, degree, institute);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Education added successfully',
    data: result,
  });
});
const updateEducation = catchAsync(async (req: Request, res: Response) => {
  const { degree, institute } = req.body;
  const { id } = req.user;
  const { educationId } = req.params;
  const result = await EducationService.updateSpecificEducationToDB(
    id,
    educationId,
    degree,
    institute
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Education updated successfully',
    data: result,
  });
});
const deleteEducation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;
  const { educationId } = req.params;
  const result = await EducationService.deleteSpecificEducationFromDB(
    id.toString(),
    educationId.toString()
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Education deleted successfully',
    data: result,
  });
});
export const EducationController = {
  addEducation,
  updateEducation,
  deleteEducation,
};
