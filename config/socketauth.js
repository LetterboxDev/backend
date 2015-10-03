var token = require('./token');
var db = require('./sequelize');

exports.authenticate = function (socket, next) {
  var errorMessage = "";
  var letterboxToken = socket.request.headers.cookies.letterbox_token;
  if (letterboxToken) {
    var decryptedToken = token.decryptToken(letterboxToken);
    if (decryptToken.hashedId) {
      db.UserAccount.findOne({
        where: {
          hashedId: decryptToken.hashedId
        }
      }).then(function(user) {
        if (user) {
          socket.request.user = user;
          return next();
        } else {
          errorMessage = "user not found";
        }
      });
    } else {
      errorMessage = "invalid token";
    }
  } else {
    errorMessage = "token not found in cookies";
  }
  return next(new Error(errorMessage));
};
