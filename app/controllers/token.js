var config = require('../../config/config');
var jwt = require('jsonwebtoken');
var db = require('../../config/sequelize');

// to be added when query param token is in url
exports.verifyToken = function(req, res, next) {
  if (typeof req.query.token != 'undefined') {
    var decoded = jwt.verify(req.query.token, 'testkey');
    if (decoded.expires > Date.now()) {
      db.UserAccount.findOne({where: {hashedId: decoded.hashedId}}).then(function(user){
        if (user) {
          req.user = user;
          return next();
        } else {
          return res.status(404).send({
            error: 'not found'
          });    
        }
      });
    } else {
      return res.status(401).send({
        error: 'token expired'
      });  
    }
  } else {
    return res.status(500).send({
      error: 'invalid params'
    });
  }
};

// generates a token for the a user with the corresponding hashedId
exports.generateToken = function(hashedId) {
  var unencryptedToken = {
    hashedId: hashedId,
    expires: Date.now() + 604800
  };

  return jwt.sign(unencryptedToken, 'testkey');
}
