var db = require('./sequelize');
var jwt = require('jsonwebtoken');
var token = require('./token');
var logger = require('./logger');

exports.cookieAuth = function(req, res, next) {
  var letterboxToken = req.cookies.letterbox_token;
  req.user = {};
  req.authentication = {isAuthenticated: false};
  if (letterboxToken) {
    var decoded = token.decryptToken(letterboxToken);
    if (decoded.expires > Date.now()) {
      db.UserAccount.findOne({
        where: {
          hashedId: decoded.hashedId
        },
        include: [
          {
            model: db.UserWyrQuestion,
            include: db.WyrQuestion
          }
        ]
      }).then(function(user) {
        if (user) {
          req.authentication.isAuthenticated = true;
          req.user = user;
          logger.info('User: ' + user.hashedId);
        } else {
          req.authentication.message = 'no user found';
          res.clearCookie('letterbox_token');
          logger.info(req.authentication.message);
        }
        return next();
      })
    } else {
      req.authentication.message = 'token expired';
      res.clearCookie('letterbox_token');
      logger.info(req.authentication.message);
      return next();
    }
  } else {
    req.authentication.message = 'no token found in cookies';
    logger.info(req.authentication.message);
    return next();
  }
};
