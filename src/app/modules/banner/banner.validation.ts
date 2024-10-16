import { z } from 'zod';
import { BANNER } from '../../../enums/banner';

const createBannerZodSchema = z.object({
  URL: z.string({ required_error: 'Banner is required' }),
  type: z.enum([BANNER.HOME, BANNER.PROFILE], {
    invalid_type_error: 'type can only by either HOME or PROFILE',
    required_error: 'type is required',
  }),
});

export const BannerValidation = {
  createBannerZodSchema,
};
