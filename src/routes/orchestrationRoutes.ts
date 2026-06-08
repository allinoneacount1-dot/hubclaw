import express from 'express';
import {
  getPipelines,
  createPipeline,
  addStep,
  removeStep,
  deletePipeline,
  runPipeline,
} from '../controllers/orchestrationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getPipelines);
router.post('/', authMiddleware, createPipeline);
router.delete('/:id', authMiddleware, deletePipeline);
router.post('/:id/steps', authMiddleware, addStep);
router.delete('/:pipelineId/steps/:stepId', authMiddleware, removeStep);
router.post('/:id/run', authMiddleware, runPipeline);

export default router;
