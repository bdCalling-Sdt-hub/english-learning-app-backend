import { Model } from 'mongoose';

export type IInfo = {
  About: string;
  Name: string;
  PrivecyPolicy: string;
  TermsAndConditions: string;
  Terms: string;
};

export type InfoModel = Model<IInfo>;
