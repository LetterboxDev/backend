var jwt = require('jsonwebtoken');

var key = 'testkey';

// generates a token for the a user with the corresponding hashedId
exports.generateToken = function(hashedId) {
  var unencryptedToken = {
    hashedId: hashedId,
    expires: Date.now() + 604800
  };

  return jwt.sign(unencryptedToken, key);
}

// decrypts the token provided with the key
exports.decryptToken = function(encryptedToken) {
  return jwt.verify(token, key);
}
