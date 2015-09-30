// Module dependencies

var express = require('express');
var http = require('http');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// Load app configuration
var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')[env];

var app = express();

// Express configuration
app.set('port', process.env.PORT || 8080);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());

// Models
var db = require(__dirname + '/config/mongoose');

// Routes
var routesDir = __dirname + '/app/routes';
var files = fs.readdirSync(routesDir);

files.forEach(function (file) {
  route = require(routesDir + '/' + file);
  route.init(app);
  console.log("Added route: " + file);
});

// Server
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Letterbox backend listening on port " + app.get('port'));
});

// socket.io configuration
require(__dirname + '/app/sockets/socket').init(server);
