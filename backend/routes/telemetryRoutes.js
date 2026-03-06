import { Router } from 'express';
import { createTelemetry } from '../controllers/telemetryController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/telemetry
router.post('/', authMiddleware, createTelemetry);

export default router;
