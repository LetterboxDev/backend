var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var morgan = require('morgan');
var logger = require('./logger');

var app = express();

// Set up logging
app.use(morgan('dev', {'stream': logger.stream}));

// Express configuration
app.set('port', process.env.PORT || 8080);
app.set('views', './app/views');
app.set('view engine', 'jade');
app.disable('view cache');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());

module.exports = app;