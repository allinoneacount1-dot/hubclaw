import { Router } from 'express';
import { runAgent, getModels, executePython, fetchGitHub, sendDiscord } from '../controllers/runController.js';
import { optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/run - Execute agent
router.post('/', optionalAuthMiddleware, runAgent);

// GET /api/models — list available OpenRouter free models
router.get('/models', getModels);

// POST /api/run/python — Execute Python code
router.post('/python', optionalAuthMiddleware, executePython);

// POST /api/run/github — Fetch GitHub repo/info
router.post('/github', optionalAuthMiddleware, fetchGitHub);

// POST /api/run/discord — Send Discord webhook
router.post('/discord', optionalAuthMiddleware, sendDiscord);

export default router;
