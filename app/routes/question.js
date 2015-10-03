var userController = require('../controllers/user');
var questionController = require('../controllers/question');

exports.init = function(app) {
  app.get('/question/self', userController.requireAuthentication, questionController.getQuestion);
  app.post('/question/self', userController.requireAuthentication, questionController.postQuestion);
}
