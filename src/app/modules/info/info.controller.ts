import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { InfoService } from './info.service';
import { INFO } from '../../../enums/info';
import { Server } from 'socket.io';

const updateAbout = catchAsync(async (req: Request, res: Response) => {
  const { ...infoData } = req.body;
  const io: Server = req.app.get('io');
  const data = {
    ...infoData,
  };
  const result = await InfoService.updateInfoToDB(data, INFO.ABOUT, io);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'About updated successfully',
    data: result,
  });
});

const updatePrivacy = catchAsync(async (req: Request, res: Response) => {
  const { ...infoData } = req.body;
  const io: Server = req.app.get('io');

  const data = {
    ...infoData,
  };
  const result = await InfoService.updateInfoToDB(data, INFO.PRIVACYPOLICY, io);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Privacy updated successfully',
    data: result,
  });
});

const updateTerms = catchAsync(async (req: Request, res: Response) => {
  const { ...infoData } = req.body;
  const io: Server = req.app.get('io');

  const data = {
    ...infoData,
  };
  const result = await InfoService.updateInfoToDB(
    data,
    INFO.TERMSANDCONDITIONS,
    io
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Terms updated successfully',
    data: result,
  });
});

const getAllInfos = catchAsync(async (req: Request, res: Response) => {
  const result = await InfoService.getAllInfosFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Infos retrieved successfully',
    data: result,
  });
});
const getAbout = catchAsync(async (req: Request, res: Response) => {
  const result = await InfoService.getInfoFromDB(INFO.ABOUT);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'About retrieved successfully',
    data: result,
  });
});

const getTerms = catchAsync(async (req: Request, res: Response) => {
  const result = await InfoService.getInfoFromDB(INFO.TERMSANDCONDITIONS);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Terms and conditions retrieved successfully',
    data: result,
  });
});
const getPrivacy = catchAsync(async (req: Request, res: Response) => {
  const result = await InfoService.getInfoFromDB(INFO.PRIVACYPOLICY);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Privacy policy retrieved successfully',
    data: result,
  });
});

export const InfoController = {
  updateAbout,
  updatePrivacy,
  updateTerms,
  getAllInfos,
  getAbout,
  getTerms,
  getPrivacy,
};
