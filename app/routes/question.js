var userController = require('../controllers/user');
var questionController = require('../controllers/question');

exports.init = function(app) {
  app.get('/question/self', userController.requireAuthentication, questionController.getQuestion);
  app.post('/question/self', userController.requireAuthentication, questionController.postQuestion);
  app.get('/question/user/:questionUserHashedId', userController.requireAuthentication, questionController.getOtherUserQuestion);
  app.post('/question/user/:questionUserHashedId', userController.requireAuthentication, questionController.postLetter);

  app.param('questionUserHashedId',  questionController.extractUserQuestion);
};
