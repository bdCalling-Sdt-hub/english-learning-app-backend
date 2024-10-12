import { Complain } from './complain.model';

const createComplainToDB = async (data: any) => {
  const result = await Complain.create(data);
  if (!result) {
    throw new Error('Complain not created');
  }
  return result;
};

const getComplainByIdFromDB = async (id: string) => {
  const result = await Complain.findById(id);
  if (!result) {
    throw new Error('Complain not found');
  }
  return result;
};

const getAllComplainsFromDB = async () => {
  const result = await Complain.find();
  if (!result) {
    throw new Error('Complains not found');
  }
  return result;
};

export const complainService = {
  createComplainToDB,
  getComplainByIdFromDB,
  getAllComplainsFromDB,
};
