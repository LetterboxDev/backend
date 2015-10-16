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
    }
  }).then(function(rooms) {
    return res.status(200).send(rooms);
  });
};

exports.getRoom = function(req, res, next, roomId) {
  db.Room.findOne({
    where: {
      hash: roomId,
      $or: [
        {user1: req.user.hashedId},
        {user2: req.user.hashedId}
      ]
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
