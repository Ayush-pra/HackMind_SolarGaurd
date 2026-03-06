import { Router } from 'express';
import { getPlants, createPlant } from '../controllers/plantController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, getPlants);
router.post('/', authMiddleware, createPlant);

export default router;
