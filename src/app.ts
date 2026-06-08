import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import agentRoutes from './routes/agentRoutes.js';
import runRoutes from './routes/runRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import promptsRoutes from './routes/promptsRoutes.js';
import orchestrationRoutes from './routes/orchestrationRoutes.js';
import tasksRoutes from './routes/tasksRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import config from './config/environment.js';

const app = express();

// Security & CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/agents', agentRoutes);
app.use('/api/run', runRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/prompts', promptsRoutes);
app.use('/api/orchestration', orchestrationRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/budget', budgetRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

export default app;
