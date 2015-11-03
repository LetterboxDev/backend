var userController = require('../controllers/user');
var dealController = require('../controllers/deal');

exports.init = function(app) {
  app.get('/deal/cat', userController.requireAuthentication, dealController.getCategories);
  app.get('/deal/cat/:dealCat', userController.requireAuthentication, dealController.getDeals);
  app.put('/deal/id/:dealId', userController.requireAuthentication, dealController.getDeal);
  app.put('/deal/id/:dealId', userController.requireAuthentication, dealController.likeDeal);
  app.get('/deal/user/:otherUserId', userController.requireAuthentication, dealController.getLikedDeals);
  app.get('/deal/mutual/:otherUserId', userController.requireAuthentication, dealController.getMutualLikedDeals);

  app.param('dealCat', dealController.getDealCategory);
  app.param('dealId', dealController.getDealById);
  app.param('otherUserId', dealController.getOtherUserById);
}
