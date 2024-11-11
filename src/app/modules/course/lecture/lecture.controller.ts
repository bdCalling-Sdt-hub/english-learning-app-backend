import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { NextFunction, Request, Response } from 'express';
import { LectureService } from './lecture.service';
import { Server } from 'socket.io';

const getLectureByID = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await LectureService.getLectureByIDFromDB(id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Lecture retrieved successfully',
      data: result,
    });
  }
);

const updateLecture = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { ...lectureData } = req.body;
  const data = {
    ...lectureData,
  };
  const result = await LectureService.updateLectureToDB(id, data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Lecture updated successfully',
    data: result,
  });
});

const deleteLecture = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await LectureService.deleteLectureFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Lecture deleted successfully',
    data: result,
  });
});

const createLecture = catchAsync(async (req: Request, res: Response) => {
  const { ...lectureData } = req.body;
  const data = {
    ...lectureData,
  };
  const result = await LectureService.createLectureToDB(data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Lecture created successfully',
    data: result,
  });
});

const updateLectureLink = catchAsync(async (req: Request, res: Response) => {
  const { courseID, link, lectureID } = req.body;
  if (!link) {
    throw new Error('Link is required');
  }
  if (!courseID) {
    throw new Error('Course ID is required');
  }
  if (!lectureID) {
    throw new Error('Lecture ID is required');
  }
  const io: Server = req.app.get('io');
  const result = await LectureService.updateLectureLinkToDB(
    lectureID,
    courseID,
    link,
    io
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Lecture link updated successfully',
    data: result,
  });
});

const getUpcomingLecture = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id.toString();
  const result = await LectureService.getUpcomingLectureFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Today's upcoming lectures retrieved successfully",
    data: result,
  });
});

const completeLecture = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const io: Server = req.app.get('io');
  const result = await LectureService.completeLectureToDB(id, io);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Lecture completed successfully',
    data: result,
  });
});

export const LectureController = {
  getLectureByID,
  updateLecture,
  deleteLecture,
  createLecture,
  updateLectureLink,
  completeLecture,
  getUpcomingLecture,
};
