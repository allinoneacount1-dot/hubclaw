import { Router } from 'express';
import { runAgent } from '../controllers/runController.js';
import { optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/run - Execute agent
router.post('/', optionalAuthMiddleware, runAgent);

export default router;
