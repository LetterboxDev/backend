var userController = require('../controllers/user');

exports.init = function(app) {
  app.get('/auth', userController.checkFacebookTokenParam, userController.validateFacebookToken, userController.getMediumProfilePicture, userController.extendFacebookToken, userController.storeUserData);
  app.get('/auth/renew', userController.requireAuthentication, userController.renewToken);

  app.get('/user/self', userController.requireAuthentication, userController.getSelf);
  app.get('/user/id/:hashedId', userController.requireAuthentication, userController.getOtherUser);
  app.put('/user/location', userController.requireAuthentication, userController.updateLocation);
  app.put('/user/bio', userController.requireAuthentication, userController.updateBio);
  app.put('/user/gender', userController.requireAuthentication, userController.updateGender);

  app.get('/match', userController.requireAuthentication, userController.getMatch, userController.sendMatch);
  
  app.param('hashedId', userController.getUser);
};
