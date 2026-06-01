import { Router } from 'express';
import { getAnalytics, getGlobalAnalytics } from '../controllers/analyticsController.js';
import { optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/analytics - Global analytics
router.get('/', optionalAuthMiddleware, getGlobalAnalytics);

// GET /api/analytics/:agentId - Per-agent analytics
router.get('/:agentId', optionalAuthMiddleware, getAnalytics);

export default router;
