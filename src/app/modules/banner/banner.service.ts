import { BANNER } from '../../../enums/banner';
import ApiError from '../../../errors/ApiError';
import unlinkFile from '../../../shared/unlinkFile';
import { IBanner } from './banner.interface';
import { BannerModel } from './banner.interface';
import { Banner } from './banner.model';
import { BannerValidation } from './banner.validation';

const createBannerToDB = async (data: IBanner) => {
  await BannerValidation.createBannerZodSchema.parseAsync(data);
  const result = await Banner.create(data);
  if (!result) {
    throw new ApiError(400, 'Faq not created');
  }
  return result;
};

const deleteBannerFromDB = async (id: string) => {
  const banner = await Banner.findById(id);
  await unlinkFile(banner?.URL!);

  const result = await Banner.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(400, 'Faq not deleted');
  }
  return result;
};

const getBannerFromDB = async () => {
  const result = await Banner.find({ type: { $ne: BANNER.PROFILE } });
  return result;
};

const getProfileBannerFromDB = async () => {
  const result = await Banner.find({ type: BANNER.PROFILE });
  return result;
};

const getBannerByIdFromDB = async (id: string) => {
  if (!id) {
    throw new ApiError(400, 'Banner id is required');
  }
  const result = await Banner.findById(id);
  if (!result) {
    throw new ApiError(400, 'Banner not found');
  }
  return result;
};

export const BannerService = {
  createBannerToDB,
  deleteBannerFromDB,
  getBannerByIdFromDB,
  getProfileBannerFromDB,
  getBannerFromDB,
};
