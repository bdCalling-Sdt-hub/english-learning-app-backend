import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { BannerService } from './banner.service';

const createBanner = catchAsync(async (req: Request, res: Response) => {
  const { ...bannerData } = req.body;
  let URL;
  if (req.files && 'banner' in req.files && req.files.banner[0]) {
    URL = `/banners/${req.files.banner[0].filename}`;
  }

  const data = {
    URL,
    ...bannerData,
  };
  const result = await BannerService.createBannerToDB(data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Banner created successfully',
    data: result,
  });
});

const deleteBanner = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await BannerService.deleteBannerFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Banner deleted successfully',
    data: result,
  });
});

const getBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.getBannerFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Banner retrieved successfully',
    data: result,
  });
});

const getProfileBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await BannerService.getProfileBannerFromDB();
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Banner retrieved successfully',
    data: result,
  });
});
const getBannerById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await BannerService.getBannerByIdFromDB(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Banner retrieved successfully',
    data: result,
  });
});
export const BannerController = {
  createBanner,
  deleteBanner,
  getProfileBanner,
  getBannerById,
  getBanner,
};
