import { LANGUAGE } from '../../../../enums/language';

export interface CourseFilterParams {
  search?: string;
  date?: string;
  gender?: string;
  priceFrom?: number;
  priceTo?: number;
  type?: string;
  studentId?: string;
  language?: LANGUAGE.ENGLISH | LANGUAGE.HEBREW | LANGUAGE.SPANISH;
}
