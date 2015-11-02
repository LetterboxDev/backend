var userController = require('../controllers/user');
var dealController = require('../controllers/deal');

exports.init = function(app) {
  app.get('/deal/cat', userController.requireAuthentication, dealController.getCategories);
  app.get('/deal/cat/:dealCat', userController.requireAuthentication, dealController.getDeals);
  app.put('/deal/id/:dealId', userController.requireAuthentication, dealController.likeDeal);

  app.param('dealCat', dealController.getDealCategory);
  app.param('dealId', dealController.getDealById);
}
