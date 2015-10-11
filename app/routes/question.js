var userController = require('../controllers/user');
var questionController = require('../controllers/question');

exports.init = function(app) {
  app.get('/question', userController.requireAuthentication, questionController.getOneRandomQuestion);
  app.get('/questions', userController.requireAuthentication, questionController.getRandomQuestions);
  app.put('/questions', userController.requireAuthentication, questionController.putUserWyrQuestions);
}
