// Module dependencies
var express = require('express');
var http = require('http');
var fs = require('fs');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var morgan = require('morgan');
var logger = require('./config/logger');

// Load app configuration
var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];

var app = express();

// Set up logging
app.use(morgan('dev', {'stream': logger.stream}));

// Express configuration
app.set('port', process.env.PORT || 8080);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());

// Set up sequelize orm
var db = require(__dirname + '/config/sequelize');

// Set up cookie authentication
require(__dirname + '/config/cookies').extractUser(app);

// Routes
var routesDir = __dirname + '/app/routes';
var files = fs.readdirSync(routesDir);

files.forEach(function (file) {
  route = require(routesDir + '/' + file);
  route.init(app);
  logger.info("Added route: " + file);
});

// Server
var server = http.createServer(app).listen(app.get('port'), function(){
  logger.info("Letterbox backend listening on port " + app.get('port'));
});

// socket.io configuration
require(__dirname + '/app/sockets/socket').init(server);
