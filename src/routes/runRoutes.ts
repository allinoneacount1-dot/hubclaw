import { Router } from 'express';
import { runAgent, getModels } from '../controllers/runController.js';
import { optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/run - Execute agent
router.post('/', optionalAuthMiddleware, runAgent);

// GET /api/models — list available OpenRouter free models
router.get('/models', getModels);

export default router;
