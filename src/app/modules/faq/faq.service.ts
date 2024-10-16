import ApiError from '../../../errors/ApiError';
import { IFaq } from './faq.interface';
import { Faq } from './faq.model';

const createFaqToDB = async (data: IFaq) => {
  const result = await Faq.create(data);
  if (!result) {
    throw new ApiError(400, 'Faq not created');
  }
  return result;
};
const editFaqToDB = async (id: string, data: Partial<IFaq>) => {
  const isExistFaq = await Faq.findById(id);
  if (!isExistFaq) {
    throw new ApiError(400, 'Faq not found');
  }
  const result = await Faq.findByIdAndUpdate(id, data, { new: true });
  if (!result) {
    throw new ApiError(400, 'Faq not updated');
  }
  return result;
};
const deleteFaqFromDB = async (id: string) => {
  const isExistFaq = await Faq.findById(id);
  if (!isExistFaq) {
    throw new ApiError(400, 'Faq not found');
  }
  const result = await Faq.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(400, 'Faq not deleted');
  }
  return result;
};
const getAllFaqsFromDB = async () => {
  const result = await Faq.find();
  return result;
};
const getFaqByIdFromDB = async (id: string) => {
  const result = await Faq.findById(id);
  if (!result) {
    throw new ApiError(400, 'Faq not found');
  }
  return result;
};
export const FaqService = {
  createFaqToDB,
  editFaqToDB,
  deleteFaqFromDB,
  getAllFaqsFromDB,
  getFaqByIdFromDB,
};
