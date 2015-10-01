var userController = require('../controllers/user');
var tokenController = require('../controllers/token');

exports.init = function(app) {
  app.get('/user/auth', userController.authenticate);
  app.get('/user/check', tokenController.verifyToken, userController.check);
  app.get('/user/question', tokenController.verifyToken, userController.getQuestion);
  app.post('/user/question', tokenController.verifyToken, userController.postQuestion);
};

