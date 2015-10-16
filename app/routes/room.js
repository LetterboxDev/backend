var userController = require('../controllers/user');
var roomController = require('../controllers/room');

exports.init = function(app) {
  app.get('/rooms', userController.requireAuthentication, roomController.getRooms);
  app.get('/rooms/:roomId', userController.requireAuthentication, roomController.getRoomMessages);

  app.param('roomId', roomController.getRoom);
};
