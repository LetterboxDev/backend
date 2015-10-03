var http = require('http');
var logger = require('./logger');
var socketIo = require('socket.io');
var cookieParser = require('socket.io-cookie');
var auth = require('./socketauth');
var app = require('./express');

// Server
var server = http.createServer(app).listen(app.get('port'), function(){
  logger.info("Letterbox backend listening on port " + app.get('port'));
});
var io = socketIo(server);

// Parses the cookies from client
io.use(cookieParser);
// Checks if the socket is from a valid user
io.use(auth.authenticate);

module.exports = io;
