var Sequelize = require('sequelize');
var fs = require('fs');
var path = require('path');
var config = require('./config');
var dbEnvironment = config[process.env.NODE_ENV || 'development'];
var _ = require('lodash');
var logger = require('./logger');
var db = {};

logger.info('Initializing Sequelize (MySQL Database)...');

var sequelize = new Sequelize(dbEnvironment.db.name, dbEnvironment.db.username, dbEnvironment.db.password, {
  host: dbEnvironment.db.host,
  password: dbEnvironment.db.password,
  dialect: 'mysql',
  logging: false
});

fs.readdirSync(config.modelsPath).filter(function(file) {
  return (file.indexOf('.') !== 0) && (file.indexOf('.js') > -1);
}).forEach(function(file) {
  logger.info('Loading model file: ' + file);
  var modelPath = path.join(config.modelsPath, file);
  var model = sequelize.import(modelPath);
  db[model.name] = model;
});

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].options.hasOwnProperty('associate')) {
    db[modelName].options.associate(db);
  }
});

sequelize.sync({force: false}).then(function() {
  logger.info('Database synced');
}).catch(function(err) {
  logger.error('An error occurred when attempting to sync to MySQL: ' + err);
})

module.exports = _.extend({
  sequelize: sequelize,
  Sequelize: Sequelize
}, db);
