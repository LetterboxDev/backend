var io = require('../../config/socketio');
var connectionsCounter = require('./countconnections');
var db = require('../../config/sequelize');

exports.notifyOfLetter = function(recipient, letterHash) {
  db.Letter.findOne({
    where: {
      hash: letterHash,
      recipient: recipient
    },
    include: [{
      model: db.LetterAnswer,
      include: db.WyrQuestion
    },{
      model: db.UserAccount,
      attributes: ['firstName', 'birthday', 'bio', 'pictureThumb', 'pictureMed']
    }]
  }).then(function(letter) {
    if (connectionsCounter.countUserConnections(recipient)) {
      io.to(recipient).emit('letter', letter);      
    } else {
      // send notifications
    }
  });
};

exports.notifyOfRoom = function(letterSender, room) {
  if (connectionsCounter.countUserConnections(letterSender)) {
    io.to(letterSender).emit('roomCreated', room);
  } else {
    // send notification
  }
}
