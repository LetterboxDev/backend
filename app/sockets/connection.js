var db = require('../../config/sequelize');
var io = require('../../config/socketio');
var logger = require('../../config/logger');
var connectionsCounter = require('./countconnections');

io.on('connection', function(socket) {
  logger.info('connection established with: ' + socket.decoded_token.hashedId);
  socket.join(socket.decoded_token.hashedId);
  socket.on('roomMessage', function(data) {
    if (data.roomHash) {
      db.Room.findOne({hash: data.roomHash}).then(function(room) {
        var user1 = room.user1, user2 = room.user2;
        var sender = user1 === socket.decoded_token.hashedId ? user1 : user2;
        var recipient = user1 !== socket.decoded_token.hashedId ? user1 : user2;
        db.UserAccount.findOne({where: {hashedId: sender}}).then(function(user) {
          db.Message.create({
            sender: sender,
            recipient: recipient,
            content: data.message,
            timeSent: Date.now(),
            RoomHash: data.roomHash
          }).then(function(message) {
            require('./notifier').notifyOfMessage(user.firstName, message);
          });
        });
      });
    }
  });
});
