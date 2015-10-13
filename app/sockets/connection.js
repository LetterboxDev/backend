var db = require('../../config/sequelize');
var io = require('../../config/socketio');
var logger = require('../../config/logger');
var connectionsCounter = require('./countconnections');

io.on('connection', function(socket) {
  logger.info('connection established with: ' + socket.decoded_token.hashedId);
  socket.join(socket.decoded_token.hashedId);
  socket.on('createRoom', function(data) {
    var self = socket.decoded_token.hashedId;
    var other = data.otherUser;
    if (data.otherUser) {
      var hash = db.Room.generateRoomHash(self, other);
      db.Room.create({
        hash: hash,
        user1: self < other ? self : other,
        user2: self > other ? self : other
      }).then(function(room) {
        var user1 = room.user1, user2 = room.user2;
        if (connectionsCounter.countUserConnections(user1)) {
          logger.info('user1 (' + user1 + ') found');
          io.to(user1).emit('roomCreated', {
            hash: room.hash
          });
        } else {
          logger.info('user1 (' + user1 + ') not found');
          // send notification
        }
        if (connectionsCounter.countUserConnections(user2)) {
          logger.info('user2 (' + user2 + ') found');
          io.to(user2).emit('roomCreated', {
            hash: room.hash
          });
        } else {
          logger.info('user2 (' + user2 + ') not found');
          // send notification
        }
      });
    }
  });
  socket.on('roomMessage', function(data) {
    if (data.roomHash) {
      db.Room.findOne({hash: data.roomHash}).then(function(room) {
        var user1 = room.user1, user2 = room.user2;
        if (connectionsCounter.countUserConnections(user1)) {
          logger.info('user1 (' + user1 + ') found');
          io.to(user1).emit('roomMessage', {
            author: socket.decoded_token.hashedId,
            authorName: data.authorName,
            message: data.message
          });
        } else {
          logger.info('user1 (' + user1 + ') not found');
          // send notification
        }
        if (connectionsCounter.countUserConnections(user2)) {
          logger.info('user2 (' + user2 + ') found');
          io.to(user2).emit('roomMessage', {
            author: socket.decoded_token.hashedId,
            authorName: data.authorName,
            message: data.message
          });
        } else {
          logger.info('user2 (' + user2 + ') not found');
          // send notification
        }
      });
    }
  });
});
