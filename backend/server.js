const app = require('./app');
const env = require('./config/env');

const server = app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});

const shutdown = () => {
  server.close(() => {
    console.log('Server shutdown complete.');
    process.exit(0);
  });
};

server.on('error', (error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
