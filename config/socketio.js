var fs = require('fs');
var https = require('https');
var logger = require('./logger');
var socketIo = require('socket.io');
var socketJwt = require('socketio-jwt');
var app = require('./express');
var privateKey  = fs.readFileSync('/etc/nginx/ssl/letterbox-key.pem', 'utf8');
var certificate = fs.readFileSync('/etc/nginx/ssl/getletterbox_com.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

// Server
var server = https.createServer(credentials, app).listen(app.get('port'), function(){
  logger.info("Letterbox backend listening on port " + app.get('port'));
});
var io = socketIo(server);

// Parses the cookies from client
io.use(socketJwt.authorize({
  secret: process.env.JWT_KEY,
  handshake: true
}));

module.exports = io;
