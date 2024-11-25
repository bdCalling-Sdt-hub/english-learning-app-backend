import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { seminarService } from './seminar.service';
import { Server } from 'socket.io';
import ApiError from '../../../errors/ApiError';

const createSeminar = catchAsync(async (req: Request, res: Response) => {
  const { ...seminarData } = req.body;
  const teacher = req.user.id;
  const io: Server = req.app.get('io');
  let banner;
  if (req.files && 'banner' in req.files && req.files.banner[0]) {
    banner = `/banners/${req.files.banner[0].filename}`;
  }
  const data = {
    banner,
    teacher,
    ...seminarData,
  };
  const result = await seminarService.createSeminarToDB(data, io);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Seminar created successfully',
    data: result,
  });
});

const updateSeminar = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { ...seminarData } = req.body;
  delete seminarData.banner;
  let banner;
  if (req.files && 'banner' in req.files && req.files.banner[0]) {
    banner = `/banners/${req.files.banner[0].filename}`;
  }
  const data = {
    banner,
    ...seminarData,
  };
  const result = await seminarService.updateSeminarToDB(id, data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Seminar updated successfully',
    data: result,
  });
});

const deleteSeminar = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await seminarService.deleteSeminarFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Seminar deleted successfully',
    data: result,
  });
});

const getAllSeminar = catchAsync(async (req: Request, res: Response) => {
  const result: any = await seminarService.getAllSeminarFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Seminar retrieved successfully',
    data: result,
  });
});

const getSeminarById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await seminarService.getSeminarByIdFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Seminar retrieved successfully',
    data: result,
  });
});

const getSeminarByTeacherId = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.teacherID;
    const result = await seminarService.getSeminarByTeacherIdFromDB(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Seminar retrieved successfully',
      data: result,
    });
  }
);

const bookSeminar = catchAsync(async (req: Request, res: Response) => {
  const { ...data } = req.body;
  const io: Server = req.app.get('io');
  const result = await seminarService.bookSeminarToDB(data, io);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Seminar booked successfully',
    data: result,
  });
});

const completeSeminar = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await seminarService.completeSeminarFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Seminar completed successfully',
    data: result,
  });
});

const addLinkToSeminar = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { link } = req.body;
  if (!link) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Link is required');
  }
  const io: Server = req.app.get('io');
  const result = await seminarService.addLinkToSeminar(id, link, io);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Link added to seminar successfully',
    data: result,
  });
});
const getBookedSeminar = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  const result = await seminarService.getBookedSeminarFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Seminar retrieved successfully',
    data: result,
  });
});

export const SeminarController = {
  createSeminar,
  updateSeminar,
  deleteSeminar,
  getAllSeminar,
  getSeminarById,
  getSeminarByTeacherId,
  bookSeminar,
  completeSeminar,
  addLinkToSeminar,
  getBookedSeminar,
};
