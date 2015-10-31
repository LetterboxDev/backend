var userController = require('../controllers/user');
var reportController = require('../controllers/report');

exports.init = function(app) {
  app.post('/report', userController.requireAuthentication, reportController.findUser, reportController.reportUser);
};
