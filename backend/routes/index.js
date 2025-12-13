// backend/routes/index.js
const fs = require('fs');
const path = require('path');

const loadRoutes = (app, basePath = '/api') => {
  const routesDir = __dirname;
  const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js') && f !== 'index.js');

  // Map route file names to their API endpoint paths
  // This ensures frontend API calls match the mounted routes
  const routeNameMap = {
    'customerRoutes.js': 'customers',
    'vehicleRoutes.js': 'vehicles',
    'serviceRoutes.js': 'services',
    'employeeRoutes.js': 'employees',
    'paymentRoutes.js': 'payments',
    'partsRoutes.js': 'parts',
    'feedbackRoutes.js': 'feedback',
    'dashboardRoutes.js': 'dashboard',
    'historyRoutes.js': 'history'
  };

  files.forEach((file) => {
    // Use mapped route name if available, otherwise extract from filename
    const routeName = routeNameMap[file] || file.replace('Routes.js', '').replace('.js', '');
    const routePath = `${basePath}/${routeName}`;
    try {
      const routeModule = require(path.join(routesDir, file));
      app.use(routePath, routeModule);
      console.log(`🔌 Mounted ${routePath} -> ${file}`);
    } catch (err) {
      console.warn(`⚠️ Could not mount ${file}: ${err.message}`);
    }
  });
};

module.exports = { loadRoutes };