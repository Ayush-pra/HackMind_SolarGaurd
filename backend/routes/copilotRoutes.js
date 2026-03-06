import { Router } from 'express';
import { analyzeInverter, askCopilot } from '../controllers/copilotController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/copilot/analyze
router.post('/analyze', authMiddleware, analyzeInverter);

// POST /api/copilot/ask  — used by frontend CopilotButton
router.post('/ask', authMiddleware, askCopilot);

// POST /api/copilot/chat — alias per spec
router.post('/chat', authMiddleware, askCopilot);

export default router;
