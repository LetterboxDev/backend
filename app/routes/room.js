var userController = require('../controllers/user');
var roomController = require('../controllers/room');

exports.init = function(app) {
  app.get('/rooms', userController.requireAuthentication, roomController.getRooms);
}
