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

export const BannerService = {
  createBannerToDB,
  deleteBannerFromDB,
};
