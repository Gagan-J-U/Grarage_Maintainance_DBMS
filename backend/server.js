// backend/server.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB, disconnectDB } = require('./config/database');
const { errorHandler } = require('./utils/errorHandler');
const { loadRoutes } = require('./routes');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from frontend, optional
  app.use(express.static(path.join(__dirname, '../frontend')));

  // Health and root
  app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Server running' }));
  app.get('/', (req, res) => {
    const indexFile = path.join(__dirname, '../frontend/pages/index.html');
    try {
      res.sendFile(indexFile);
    } catch (err) {
      res.send('Frontend not available');
    }
  });

  // Load API routes automatically
  loadRoutes(app, '/api');

  // 404 for API paths
  app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, error: 'API endpoint not found' });
  });

  // Global error handler
  app.use(errorHandler);

  // Connect to DB
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📂 Frontend: http://localhost:${PORT}`);
    console.log(`🔌 API: http://localhost:${PORT}/api`);
  });

  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async (err) => {
      if (err) {
        console.error('Error during server shutdown:', err);
        process.exit(1);
      }
      await disconnectDB();
      console.log('Shutdown complete.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    process.exit(1);
  });
};

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});