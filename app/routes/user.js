var userController = require('../controllers/user');

exports.init = function(app) {
  app.get('/auth', userController.checkFacebookTokenParam, userController.validateFacebookToken, userController.getMediumProfilePicture, userController.extendFacebookToken, userController.storeUserData);
  app.get('/auth/renew', userController.requireAuthentication, userController.setRenewVars, userController.extendFacebookTokenIfNecessary, userController.validateFacebookToken, userController.renewToken);

  app.get('/user/self', userController.requireAuthentication, userController.getSelf);
  app.get('/user/id/:hashedId', userController.requireAuthentication, userController.getOtherUser);
  app.get('/user/id/:hashedId/version', userController.requireAuthentication, userController.getOtherUserVersion);
  app.get('/user/photo', userController.requireAuthentication, userController.getProfilePhotoAlbum, userController.getProfilePhotos);
  app.put('/user/photo', userController.requireAuthentication, userController.checkPictureId, userController.getMediumPhoto, userController.updateProfilePhoto);
  app.put('/user/perfectmatch', userController.requireAuthentication, userController.setPerfectMatch);
  app.put('/user/pushtoken', userController.requireAuthentication, userController.setPushToken);
  app.delete('/user/pushtoken', userController.requireAuthentication, userController.clearPushToken);
  app.put('/user/location', userController.requireAuthentication, userController.updateLocation);
  app.put('/user/bio', userController.requireAuthentication, userController.updateBio);
  app.put('/user/genderPreference', userController.requireAuthentication, userController.updateGenderPreference);
  app.put('/user/version', userController.requireAuthentication, userController.setVersion);
  app.put('/user/deactivate', userController.requireAuthentication, userController.deactivate);

  app.get('/match', userController.requireAuthentication, userController.clearRecordedMatches, userController.getMatch, userController.recordMatch, userController.getMatchLikedDeals, userController.sendMatch);
  app.get('/matches', userController.requireAuthentication, userController.getMultipleMatches, userController.sendMultipleMatches);
  
  app.param('hashedId', userController.getUser);
};
