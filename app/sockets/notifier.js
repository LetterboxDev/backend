var io = require('../../config/socketio');
var logger = require('../../config/logger');
var connectionsCounter = require('./countconnections');
var db = require('../../config/sequelize');
var https = require('https');

function sendPushNotification(hashedId, message) {
  db.UserAccount.findOne({
    where: {
      hashedId: hashedId
    }
  }).then(function(user) {
    logger.info('Sending push notification to ' + hashedId + ': ' + message);
    var notification = {
      'tokens': [user.pushToken],
      'notification': {
        'alert': message
      }
    };
    var data = JSON.stringify(notification);
    var secret = new Buffer(process.env.IONIC_PRIVATE_KEY).toString('base64').replace(/\n/g, '') + ':';
    var options = {
      hostname: 'push.ionic.io',
      port: 443,
      path: '/api/v1/push',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'X-Ionic-Application-Id': '64f32017',
        'Authorization': 'Basic ' + secret
      }
    };
    var post = https.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        logger.info('Response: ' + chunk);
      });
    });

    post.write(data);
    post.end();
  });
}

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
      sendPushNotification(recipient, "You've received a letter!");
    }
  });
};

exports.notifyOfRoom = function(letterSender, room, approver) {
  if (connectionsCounter.countUserConnections(letterSender)) {
    io.to(letterSender).emit('roomCreated', {room: room, approverName: approver.firstName});
  } else {
    // send notification
    sendPushNotification(letterSender, approver.firstName + " just started a chat with you!");
  }
};

exports.notifyOfMessage = function(senderName, message) {
  var res = {senderName: senderName, message: message};
  io.to(message.sender).emit('roomMessage', res);
  if (connectionsCounter.countUserConnections(message.recipient)) {
    io.to(message.recipient).emit('roomMessage', res);
  } else {
    // send notification of message from senderName
    sendPushNotification(letterSender, senderName + ": " + message.content);
  }
};
