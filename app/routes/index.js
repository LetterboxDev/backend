var indexController = require('../controllers/index');

exports.init = function(app) {
  app.get('/', indexController.render);
}