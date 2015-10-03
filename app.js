// Module dependencies
var fs = require('fs');
var logger = require('./config/logger');

var app = require('./config/express');

// Set up sequelize orm
var db = require(__dirname + '/config/sequelize');

// Set up cookie authentication
require(__dirname + '/config/cookies').extractUser(app);

// Socket.io configuration
var io = require('./config/socketio');

// Routes
var routesDir = __dirname + '/app/routes';
var files = fs.readdirSync(routesDir);

files.forEach(function (file) {
  route = require(routesDir + '/' + file);
  route.init(app);
  logger.info("Added route: " + file);
});
