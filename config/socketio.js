var http = require('http');
var logger = require('./logger');
var socketIo = require('socket.io');
var socketJwt = require('socketio-jwt');
var app = require('./express');

// Server
var server = http.createServer(app).listen(app.get('port'), function(){
  logger.info("Letterbox backend listening on port " + app.get('port'));
});
var io = socketIo(server);

// Parses the cookies from client
io.use(socketJwt.authorize({
  secret: process.env.JWT_KEY,
  handshake: true
}));

module.exports = io;
