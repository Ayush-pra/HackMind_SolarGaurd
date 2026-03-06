import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/dashboard/:plantId
router.get('/:plantId', authMiddleware, getDashboard);

export default router;
