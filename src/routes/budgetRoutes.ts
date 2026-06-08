import express from 'express';
import { getBudget, setBudget } from '../controllers/budgetController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getBudget);
router.post('/', authMiddleware, setBudget);

export default router;
