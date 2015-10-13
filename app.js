// Module dependencies
var fs = require('fs');
var logger = require('./config/logger');

var app = require('./config/express');

// Set up sequelize orm
var db = require(__dirname + '/config/sequelize');

// Socket.io configuration
var io = require('./config/socketio');

// Sockets
var socketsDir = __dirname + '/app/sockets';
var socketFiles = fs.readdirSync(socketsDir);

socketFiles.forEach(function(file) {
  require(socketsDir + '/' + file);
  logger.info("Added socket: " + file);
});

// Routes
var routesDir = __dirname + '/app/routes';
var routeFiles = fs.readdirSync(routesDir);

routeFiles.forEach(function(file) {
  route = require(routesDir + '/' + file);
  route.init(app);
  logger.info("Added route: " + file);
});
