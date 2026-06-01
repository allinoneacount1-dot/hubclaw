import app from './app.js';
import config from './config/environment.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 HubClaw API running on port ${PORT}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🤖 Mock AI: ${config.mockAi ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
