var jwt = require('jsonwebtoken');

// generates a token for the a user with the corresponding hashedId
exports.generateToken = function(hashedId) {
  var unencryptedToken = {
    hashedId: hashedId,
    expires: Date.now() + 604800
  };

  return jwt.sign(unencryptedToken, 'testkey');
}
