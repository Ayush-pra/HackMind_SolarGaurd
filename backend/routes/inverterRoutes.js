import { Router } from 'express';
import { getInvertersByPlant, createInverter } from '../controllers/inverterController.js';
import { getInverterDetails, getRiskTrend, getPowerAnalysis } from '../controllers/inverterDetailsController.js';
import { analyzeInverterByParam } from '../controllers/copilotController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Create inverter (POST /api/inverters)
router.post('/', authMiddleware, createInverter);

// Inverter details (GET /api/inverters/:inverterId)
router.get('/:inverterId', authMiddleware, getInverterDetails);

// AI analysis trigger (POST /api/inverters/:inverterId/analyze)
router.post('/:inverterId/analyze', authMiddleware, analyzeInverterByParam);

// Risk trend (GET /api/inverters/:inverterId/risk-trend) — kept under /api/inverter/ as spec'd
// These are on a separate router, see inverterAnalyticsRoutes.js

export default router;
