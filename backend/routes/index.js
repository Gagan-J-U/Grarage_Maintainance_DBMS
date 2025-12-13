// backend/routes/index.js
const fs = require('fs');
const path = require('path');

const loadRoutes = (app, basePath = '/api') => {
  const routesDir = __dirname;
  const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js') && f !== 'index.js');

  files.forEach((file) => {
    const routeName = file.replace('Routes.js', '').replace('.js', '');
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