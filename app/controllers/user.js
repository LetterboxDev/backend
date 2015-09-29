/**
 * User controller
 */

var config = require('../../config/config');
var jwt = require('jsonwebtoken');
var UserModel = require(config.modelsPath + '/user');
var graph = require('fbgraph');

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
        if (!err) {
          var profileId = fbResponse.id;
          var hashedId = require('crypto').createHash('md5').update(profileId).digest('hex');
          var gender = fbResponse.gender;

          var user = UserModel.findOne({profileId: profileId});
          console.log(hashedId);
          if (!user) {
            user = new UserModel({
              profileId: profileId,
              hashedId: hashedId,
              gender: gender,
              accessToken: fb_token
            });
            user.save();
          }
          var unencryptedToken = {
            hashedId: hashedId,
            expires: Date.now() + 604800
          };
          var encryptedToken = jwt.sign(unencryptedToken, 'testkey');
          res.status(200).send({
            hashedId: hashedId,
            access_token: encryptedToken
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

  app.get('/check', function(req, res) {
    if (typeof req.query.token != 'undefined') {
      var decoded = jwt.verify(req.query.token, 'testkey');
      res.send(decoded);
    } else {
      res.status(500).send({
        error: 'invalid params'
      });
    }
  });
}