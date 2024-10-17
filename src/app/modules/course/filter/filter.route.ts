import express from 'express';
import { filterController } from './filter.controller';
const router = express.Router();
router.get('/gender/:gender', filterController.filterCourseByGender);
router.get('/date/:date', filterController.filterCourseByDate);
router.get('/rate', filterController.filterCourseByRate);

export const filterRoutes = router;
