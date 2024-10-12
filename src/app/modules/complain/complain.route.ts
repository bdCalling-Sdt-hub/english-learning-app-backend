import express from 'express';
import { ComplainController } from './complain.controller';

const router = express.Router();
router.post('/', ComplainController.createComplain);
router.get('/:id', ComplainController.getComplainById);
router.get('/', ComplainController.getAllComplains);

export const ComplainRoutes = router;
