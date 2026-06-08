import express from 'express';
import { getPrompts, createPrompt, deletePrompt } from '../controllers/promptsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getPrompts);
router.post('/', authMiddleware, createPrompt);
router.delete('/:id', authMiddleware, deletePrompt);

export default router;
