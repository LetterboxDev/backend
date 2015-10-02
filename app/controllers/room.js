/**
 *  Room controller
 */

var db = require('../../config/sequelize');

exports.getRooms = function (req, res) {
  db.Room.findAll({
    where: {
      $or: [
        {user1: req.user.hashedId},
        {user2: req.user.hashedId}
      ]
    }
  }).then(function(rooms) {
    res.status(200).send(rooms);
  });
}
