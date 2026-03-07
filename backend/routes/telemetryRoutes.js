import { Router } from 'express';
import { createTelemetry, healthCheck } from '../controllers/telemetryController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Health check - no auth required
router.get('/health', healthCheck);

// POST /api/telemetry
router.post('/', authMiddleware, createTelemetry);

export default router;
