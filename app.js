// Module dependencies
var fs = require('fs');
var logger = require('./config/logger');

var app = require('./config/express');

// Set up sequelize orm
var db = require(__dirname + '/config/sequelize');

// Socket.io configuration
var io = require('./config/socketio');

// Sockets
var socketsPath = __dirname + '/app/sockets/connection.js';
require(socketsPath);
logger.info("Added socket: connection.js");

// Routes
var routesDir = __dirname + '/app/routes';
var routeFiles = fs.readdirSync(routesDir);

// Rate Limiter for entire application
var redisClient = require('redis').createClient();
var limiter = require('express-limiter')(app, redisClient);

limiter({
  path: '*',
  method: 'all',
  lookup: ['user.id', 'connection.remoteAddress']
});

routeFiles.forEach(function(file) {
  route = require(routesDir + '/' + file);
  route.init(app);
  logger.info("Added route: " + file);
});
