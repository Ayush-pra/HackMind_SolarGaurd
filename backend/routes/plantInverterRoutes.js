import { Router } from 'express';
import { getInvertersByPlant } from '../controllers/inverterController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/plants/:plantId/inverters
router.get('/:plantId/inverters', authMiddleware, getInvertersByPlant);

export default router;
