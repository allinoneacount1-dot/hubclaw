import { Router } from 'express';
import { getAgents, getAgentById, createAgent, forkAgent } from '../controllers/agentController.js';
import { optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Public endpoints (optional auth)
router.get('/', optionalAuthMiddleware, getAgents);
router.get('/:id', optionalAuthMiddleware, getAgentById);

// Protected endpoints
router.post('/', optionalAuthMiddleware, createAgent);
router.post('/:id/fork', optionalAuthMiddleware, forkAgent);

export default router;
