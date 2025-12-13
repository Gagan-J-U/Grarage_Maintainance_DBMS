// refactor.js — aggregated entry
// Re-export models and controllers for backward compatibility.

module.exports = {
  models: require('./backend/models'),
  controllers: require('./backend/controllers')
};