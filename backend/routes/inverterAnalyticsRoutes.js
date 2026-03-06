import { Router } from 'express';
import { getRiskTrend, getPowerAnalysis } from '../controllers/inverterDetailsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/inverter/:inverterId/risk-trend
router.get('/:inverterId/risk-trend', authMiddleware, getRiskTrend);

// GET /api/inverter/:inverterId/power-analysis
router.get('/:inverterId/power-analysis', authMiddleware, getPowerAnalysis);

export default router;
