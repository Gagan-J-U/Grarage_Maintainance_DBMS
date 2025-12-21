// backend/server.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB, disconnectDB } = require('./config/database');
const { errorHandler } = require('./utils/errorHandler');
const { loadRoutes } = require('./routes');

// Removed dynamic port search helper; server will listen on configured port directly.

// Convert environment variable to number with validation
// process.env.PORT is always a string, so we must parse it

const PORT = 5000; // Default port

const startServer = async () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from frontend
  app.use(express.static(path.join(__dirname, '../frontend')));
  app.use('/pages', express.static(path.join(__dirname, '../frontend/pages')));
  app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
  app.use('/js', express.static(path.join(__dirname, '../frontend/js')));

  // Health endpoint (before routes to avoid conflicts)
  app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Server running' }));

  // Load API routes automatically (must be before 404 handler)
  loadRoutes(app, '/api');

  // Serve HTML pages - add explicit routes for each page
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
  });
  
  // Route handlers for all HTML pages to prevent "Cannot GET" errors
  const pages = ['index', 'services', 'service-details', 'inventory', 'employees', 'payments', 'history', 'feedback'];
  pages.forEach(page => {
    app.get(`/pages/${page}.html`, (req, res) => {
      res.sendFile(path.join(__dirname, `../frontend/pages/${page}.html`));
    });
    // Also allow access without .html extension
    if (page !== 'index') {
      app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, `../frontend/pages/${page}.html`));
      });
    }
  });

  // 404 handler for API paths (must be after routes are loaded)
  // This catches any unmatched /api/* routes - app.use matches all HTTP methods
  app.use('/api', (req, res) => {
    res.status(404).json({ success: false, error: 'API endpoint not found' });
  });

  // Global error handler
  app.use(errorHandler);

  // Connect to DB
  await connectDB();

  // Use configured port directly
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📂 Frontend: http://localhost:${PORT}`);
    console.log(`🔌 API: http://localhost:${PORT}/api`);
  });

  // Global error handlers
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