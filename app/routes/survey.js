var userController = require('../controllers/user');
var surveyController = require('../controllers/survey');

exports.init = function(app) {
  app.get('/survey', userController.requireAuthentication, surveyController.getAll);
  app.get('/survey/onboarding', userController.requireAuthentication, surveyController.getOnboarding);
  app.get('/survey/onboarding/responses', userController.requireAuthentication, surveyController.getOnboardingResponses);
  app.get('/survey/responses', userController.requireAuthentication, surveyController.getAllResponses);
};
