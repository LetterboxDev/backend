/**
 *  Room controller
 */

var db = require('../../config/sequelize');

exports.getRooms = function(req, res) {
  db.Room.findAll({
    where: {
      $or: [
        {user1: req.user.hashedId},
        {user2: req.user.hashedId}
      ]
    },
    include: [{
      model: db.Letter
    }]
  }).then(function(rooms) {
    var users = [];
    var plainRooms = [];
    for (var i = 0; i < rooms.length; i++) {
      var room = rooms[i].get({plain: true});
      if (users.indexOf(room.user1) === -1) users.push(room.user1);
      if (users.indexOf(room.user2) === -1) users.push(room.user2);
      plainRooms.push(room);
    }
    db.UserAccount.findAll({where: {hashedId: {$in: users}}}).then(function(userAccounts) {
      for (var i = 0; i < plainRooms.length; i++) {
        var room = plainRooms[i];
        var otherUser = room.user1 !== req.user.hashedId ? room.user1 : room.user2;
        for (var j = 0; j < userAccounts.length; j++) {
          if (userAccounts[j].hashedId === otherUser) {
            room.userId = otherUser;
            room.userName = userAccounts[j].firstName;
            room.thumbnail = userAccounts[j].pictureThumb;
            room.profilePicture = userAccounts[j].pictureMed;
            break;
          }
        }
      }
      return res.status(200).send(plainRooms);
    });
  });
};

exports.getSingleRoom = function(req, res) {
  var otherUserHash = req.room.user1 !== req.user.hashedId ? req.room.user1 : req.room.user2;
  db.UserAccount.findOne({
    where: {
      hashedId: otherUserHash
    }
  }).then(function(user) {
    db.Message.findOne({
      where: {
        RoomHash: req.room.hash
      },
      order: [['timeSent', 'DESC']]
    }).then(function(latestMessage) {
      var room = {};
      room.hash = req.room.hash;
      room.userId = user.hashedId;
      room.userName = user.firstName;
      room.thumbnail = user.pictureThumb;
      room.profilePicture = user.pictureMed;
      room.createdAt = req.room.createdAt;
      room.latestMessage = {};
      if (latestMessage) {
        room.latestMessage.sender = latestMessage.sender;
        room.latestMessage.content = latestMessage.content;
        room.latestMessage.timeSent = latestMessage.timeSent;
      }
      return res.send(room);
    })
  });
};

exports.getRoom = function(req, res, next, roomId) {
  db.Room.findOne({
    where: {
      hash: roomId,
      $or: [
        {user1: req.user.hashedId},
        {user2: req.user.hashedId}
      ],
      include: [{
        model: db.Letter
      }]
    }
  }).then(function(room) {
    if (room) {
      req.room = room;
      return next();
    } else {
      return res.status(404).send({
        error: 'room not found'
      });
    }
  });
};

exports.getRoomMessages = function(req, res) {
  var whereClause = {
    RoomHash: req.room.hash
  };
  if (req.query.since) {
    whereClause.timeSent = {
      $gt: req.query.since
    };
  }
  db.Message.findAll({
    where: whereClause,
    order: [['timeSent', 'ASC']]
  }).then(function(messages) {
    return res.send(messages);
  });
};

exports.getMessages = function(req, res) {
  var whereClause = {
    $or: [{
      sender: req.user.hashedId
    },{
      recipient: req.user.hashedId
    }]
  };
  if (req.query.since) {
    whereClause.timeSent = {
      $gt: req.query.since
    };
  }
  db.Message.findAll({
    where: whereClause,
    order: [['timeSent', 'ASC']]
  }).then(function(messages) {
    return res.send(messages);
  });
};
