import { Router } from 'express';
import { getInvertersByPlant, createInverter } from '../controllers/inverterController.js';
import { getInverterDetails, getRiskTrend, getPowerAnalysis, getAIAnalysis } from '../controllers/inverterDetailsController.js';
import { analyzeInverterByParam } from '../controllers/copilotController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Create inverter (POST /api/inverters)
router.post('/', authMiddleware, createInverter);

// Inverter details (GET /api/inverters/:inverterId)
router.get('/:inverterId', authMiddleware, getInverterDetails);

// AI analysis (GET /api/inverters/:inverterId/analyze)
router.get('/:inverterId/analyze', authMiddleware, getAIAnalysis);

// Risk trend (GET /api/inverters/:inverterId/risk-trend) — kept under /api/inverter/ as spec'd
// These are on a separate router, see inverterAnalyticsRoutes.js

export default router;
