var db = require('../../config/sequelize');
var io = require('../../config/socketio');
var logger = require('../../config/logger');
var connectionsCounter = require('./countconnections');

function createMessage(sender, recipient, type, content, RoomHash, deal) {
  db.UserAccount.findOne({where: {hashedId: sender}}).then(function(user) {
    db.Message.create({
      sender: sender,
      recipient: recipient,
      type: type,
      content: content,
      timeSent: Date.now(),
      RoomHash: RoomHash,
      DealId: deal ? deal.id : null
    }).then(function(message) {
      require('./notifier').notifyOfMessage(user.firstName, message);
    });
  });
}

io.on('connection', function(socket) {
  logger.info('connection established with: ' + socket.decoded_token.hashedId);
  socket.join(socket.decoded_token.hashedId);
  socket.on('roomMessage', function(data) {
    if (data.roomHash) {
      db.Room.findOne({
        where: {
          hash: data.roomHash,
          $or: [
            {user1: socket.decoded_token.hashedId},
            {user2: socket.decoded_token.hashedId}
          ]
        }
      }).then(function(room) {
        var user1 = room.user1, user2 = room.user2;
        var sender = user1 === socket.decoded_token.hashedId ? user1 : user2;
        var recipient = user1 !== socket.decoded_token.hashedId ? user1 : user2;
        if (data.type === 'share') {
          db.Deal.findOne({
            where: {
              id: data.dealId
            },
            include: [db.DealLike, db.DealImage, db.DealProvider]
          }).then(function(deal) {
            if (deal) {
              createMessage(sender, recipient, 'share', data.message, data.roomHash, deal);
            }
          });
        } else {
          createMessage(sender, recipient, 'message', data.message, data.roomHash);
        }
      });
    }
  });
});
