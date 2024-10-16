import { Model } from 'mongoose';
import { BANNER } from '../../../enums/banner';

export type IBanner = {
  URL: string;
  type: BANNER.HOME | BANNER.PROFILE;
};

export type BannerModel = Model<IBanner>;
