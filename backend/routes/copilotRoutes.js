import { Router } from 'express';
import { analyzeInverter, askCopilot } from '../controllers/copilotController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/copilot/analyze
router.post('/analyze', authMiddleware, analyzeInverter);

// POST /api/copilot/ask
router.post('/ask', authMiddleware, askCopilot);

export default router;
