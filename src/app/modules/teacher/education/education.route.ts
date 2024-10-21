import express from 'express';
import { EducationController } from './education.controller';
const router = express.Router();
router.post('/add', EducationController.addEducation);
router.patch('/:educationId', EducationController.updateEducation);
router.delete('/:educationId', EducationController.deleteEducation);
export const EducationRoutes = router;
