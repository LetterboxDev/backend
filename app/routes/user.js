var userController = require('../controllers/user');

exports.init = function(app) {
  app.get('/auth', userController.checkFacebookTokenParam, userController.validateFacebookToken, userController.extendFacebookToken, userController.storeUserData);
  app.get('/auth/logout', userController.requireAuthentication, userController.logout);

  app.get('/user/self', userController.requireAuthentication, userController.getSelf);
  app.get('/user/id/:hashedId', userController.requireAuthentication, userController.getOtherUser);
  app.param('hashedId', userController.getUser);
};
