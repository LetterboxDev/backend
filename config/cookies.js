var db = require('./sequelize');
var jwt = require('jsonwebtoken');

exports.extractUser = function(app) {
  app.use(function(req, res, next) {
    var token = req.cookies.letterbox_token;
    req.user = {};
    req.authentication = {isAuthenticated: false};
    if (token) {
      var decoded = jwt.verify(token, 'testkey');
      if (decoded.expires > Date.now()) {
        db.UserAccount.findOne({
          where: {
            hashedId: decoded.hashedId
          }
        }).then(function(user) {
          if (user) {
            req.authentication.isAuthenticated = true;
            req.user = user;
          } else {
            req.authentication.message = 'no user found';
          }
          next();
        })
      } else {
        req.authentication.message = 'token expired';
        next();
      }
    } else {
      req.authentication.message = 'no token provided';
      next();
    }
  });
}
