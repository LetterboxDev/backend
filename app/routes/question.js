var userController = require('../controllers/user');
var questionController = require('../controllers/question');

exports.init = function(app) {
  app.get('/question', userController.requireAuthentication, questionController.getQuestion);
  app.post('/question', userController.requireAuthentication, questionController.postQuestion);
}
