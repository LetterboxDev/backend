var socketIo = require('socket.io');
var cookieParser = require('socket.io-cookie');
var db = require('../../config/sequelize');
var auth = require('./auth');

exports.init = function(server) {
  var io = socketIo(server);

  // Parses the cookies from client
  io.use(cookieParser);
  // Checks if the socket is from a valid user
  io.use(auth.authenticate);

  
};
