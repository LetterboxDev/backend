/**
 * User controller
 */

var config = require('../../config/config');
var tokenController = require('./token');
var db = require('../../config/sequelize');
var graph = require('fbgraph');

exports.authenticate = function(req, res) {
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

        db.UserAccount.findOne({where: {hashedId: hashedId}}).then(function(user) {
          var status = 'returning';
          if (!user) {
            status = 'new';
            db.UserAccount.create({
              profileId: profileId,
              hashedId: hashedId,
              gender: gender,
              accessToken: fb_token
            })
          } else if (!user.isRegistered) {
            status = 'new';
          }

          var encryptedToken = tokenController.generateToken(hashedId);
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
}

exports.check = function(req, res) {
  if (req.user) {
    res.send('valid user');
  }
}

exports.getQuestion = function(req, res) {
  db.ProfileQuestion.findOne({
    order: [
      ['updatedAt', 'DESC']
    ]
  }).then(function(question) {
    if (question == null) {
      res.status(400).send({
        status: 'Cannot find active profile question'
      });
    } else {
      res.status(200).send({
        question: question.question
      });
    }
  });
};

