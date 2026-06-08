import express from 'express';
import { getTasks, createTask } from '../controllers/tasksController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getTasks);
router.get('/:agentId', authMiddleware, getTasks);
router.post('/', authMiddleware, createTask);

export default router;
