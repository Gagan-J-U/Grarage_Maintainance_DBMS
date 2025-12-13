// backend/server.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB, disconnectDB } = require('./config/database');
const { errorHandler } = require('./utils/errorHandler');
const { loadRoutes } = require('./routes');

/**
 * Get an available port, trying subsequent ports if the initial port is in use.
 * 
 * BUG FIX EXPLANATION:
 * The original bug occurred because process.env.PORT is always a string in Node.js.
 * When currentPort was a string like "5000", the expression currentPort + 1 performed
 * string concatenation instead of numeric addition, resulting in "50001", "500011", etc.
 * 
 * FIX:
 * - Convert startPort to a number using parseInt() with validation
 * - Ensure currentPort is always treated as a number when incrementing
 * - Add bounds checking to prevent ports exceeding 65535 (max valid port)
 * - Validate port range (0-65535) before attempting to use it
 */
const getAvailablePort = (startPort, maxAttempts = 10) => {
  const net = require('net');
  
  // Convert startPort to a number and validate
  const startPortNum = parseInt(startPort, 10);
  if (isNaN(startPortNum) || startPortNum < 0 || startPortNum > 65535) {
    return Promise.reject(new Error(`Invalid starting port: ${startPort}. Must be between 0 and 65535.`));
  }
  
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const MAX_PORT = 65535; // Maximum valid port number
    
    const tryPort = (currentPort) => {
      // Validate port is within valid range
      if (currentPort > MAX_PORT) {
        return reject(new Error(`No available ports found. Reached maximum port limit (${MAX_PORT}).`));
      }
      
      // Check max attempts
      if (attempts >= maxAttempts) {
        return reject(new Error(`No available ports found after ${maxAttempts} attempts (tried ports ${startPortNum} to ${currentPort - 1}).`));
      }
      
      const server = net.createServer()
        .once('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`Port ${currentPort} is in use, trying next port...`);
            attempts++;
            // CRITICAL: Ensure numeric addition, not string concatenation
            const nextPort = Number(currentPort) + 1;
            tryPort(nextPort);
          } else {
            reject(err);
          }
        })
        .once('listening', () => {
          server.once('close', () => {
            // Ensure we return a number, not a string
            resolve(Number(currentPort));
          }).close();
        })
        .listen(currentPort);
    };
    
    tryPort(startPortNum);
  });
};

// Convert environment variable to number with validation
// process.env.PORT is always a string, so we must parse it
const DEFAULT_PORT = 5000;
const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : null;
const PORT = (envPort && !isNaN(envPort) && envPort >= 0 && envPort <= 65535) 
  ? envPort 
  : DEFAULT_PORT;

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

  // Get an available port
  const port = await getAvailablePort(PORT);
  
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📂 Frontend: http://localhost:${port}`);
    console.log(`🔌 API: http://localhost:${port}/api`);
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