var userController = require('../controllers/user');
var questionController = require('../controllers/question');

exports.init = function(app) {
  app.get('/questions', userController.requireAuthentication, questionController.getRandomQuestions);
  app.put('/questions', userController.requireAuthentication, questionController.putWyrSet);
}
