import express from 'express';
import { filterController } from './filter.controller';
const router = express.Router();
router.get('/gender/:gender', filterController.filterCourseByGender);
router.get('/date/:date', filterController.filterCourseByDate);
router.get('/rate', filterController.filterCourseByRate);
router.get('/search', filterController.filterCourseBySearch);
export const filterRoutes = router;
