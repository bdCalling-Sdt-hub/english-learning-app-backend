import express from 'express';
import { SkillsController } from './skills.controller';

const router = express.Router();

router.post('/add', SkillsController.addSkill);
router.delete('/remove/:skill', SkillsController.removeSkill);
export const SkillsRoutes = router;
