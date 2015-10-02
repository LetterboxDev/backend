var userController = require('../controllers/user');

exports.init = function(app) {
  app.get('/user/auth', userController.checkFacebookTokenParam, userController.validateFacebookToken, userController.extendFacebookToken, userController.storeUserData);
  app.get('/user/check', userController.requireAuthentication, userController.check);
  app.get('/user/logout', userController.requireAuthentication, userController.logout);
  app.get('/user/question', userController.requireAuthentication, userController.getQuestion);
  app.post('/user/question', userController.requireAuthentication, userController.postQuestion);
}
