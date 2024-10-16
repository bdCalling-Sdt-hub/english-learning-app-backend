interface IFilter {
  field: string;
  value: string;
}

export const universalFilter = async (model: any, filter: IFilter) => {
  const data = await model.find({ [filter.field]: filter.value });
  if (!data) throw new Error('Data not found');
  return data;
};
