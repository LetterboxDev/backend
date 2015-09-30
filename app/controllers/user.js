/**
 * User controller
 */

var config = require('../../config/config');
var jwt = require('jsonwebtoken');
var UserModel = require(config.modelsPath + '/user');
var graph = require('fbgraph');

// to be added when query param token is in url
var verifyToken = function(req, res, next) {
  if (typeof req.query.token != 'undefined') {
    var decoded = jwt.verify(req.query.token, 'testkey');
    if (decoded.expires > Date.now()) {
      UserModel.where({hashedId: decoded.hashedId}).findOne(function(err, user){
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

exports.init = function(app) {
  app.get('/auth', function(req, res) {
    if (typeof req.query.fb_token != 'undefined') {
      var conf = {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET
      }

      var fb_token = req.query.fb_token;
      graph.setAccessToken(fb_token);

      graph.get('/me?fields=id,gender', function(err, fbResponse) {
        if (!err && fbResponse) {
          var profileId = fbResponse.id;
          var hashedId = require('crypto').createHash('md5').update(profileId).digest('hex');
          var gender = fbResponse.gender;

          UserModel.where({profileId: profileId}).findOne(function(err, user){
            var status = 'returning';
            if (!user) {
              status = 'new';
              user = new UserModel({
                profileId: profileId,
                hashedId: hashedId,
                gender: gender,
                accessToken: fb_token
              });
              user.save();
            } else if (!user.isRegistered) {
              status = 'new';
            }

            var unencryptedToken = {
              hashedId: hashedId,
              expires: Date.now() + 604800
            };
            var encryptedToken = jwt.sign(unencryptedToken, 'testkey');
            res.status(200).send({
              status: status,
              hashedId: hashedId,
              access_token: encryptedToken
            });
          });
        } else {
          res.status(401).send({
            error: 'invalid facebook access token'
          });
        }
      });
    } else {
      res.status(500).send({
        error: 'invalid params'
      });
    }
  });

  app.get('/check', verifyToken, function(req, res) {
    if (req.user) {
      res.send('valid user');
    }
  });
}
