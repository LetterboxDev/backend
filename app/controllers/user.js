/**
 * User controller
 */

var config = require('../../config/config');
var token = require('../../config/token');
var db = require('../../config/sequelize');
var graph = require('fbgraph');

/**
 *  To be called any time an API requires authentication
 */
exports.requireAuthentication = function(req, res, next) {
  if (req.authentication.isAuthenticated) {
    return next();
  } else {
    return res.status(400).send({
      error: req.authentication.message
    });
  }
};

exports.checkFacebookTokenParam = function(req, res, next) {
  if (typeof req.query.fb_token !== 'undefined') {
    req.fb_token = req.query.fb_token;
    next();
  } else {
    res.status(400).send({
      error: 'invalid params, fb_token required'
    });
  }
};

exports.validateFacebookToken = function(req, res, next) {
  graph.setAccessToken(req.fb_token);
  graph.get('/me?fields=id,first_name,last_name,birthday,gender', function(err, fbResponse) {
    if (!err && fbResponse) {
      req.profileId = fbResponse.id;
      req.firstName = fbResponse.first_name;
      req.lastName = fbResponse.last_name;
      req.birthday = new Date(fbResponse.birthday);
      req.gender = fbResponse.gender;
      return next();
    } else {
      return res.status(400).send({
        error: 'invalid facebook access token'
      });
    }   
  });
};

exports.extendFacebookToken = function(req, res, next) {
  graph.setAccessToken(req.fb_token);
  graph.extendAccessToken({
    'access_token': req.fb_token,
    'client_id': process.env.FACEBOOK_APP_ID,
    'client_secret': process.env.FACEBOOK_APP_SECRET
  }, function(err, facebookRes) {
    if (!err && facebookRes) {
      req.fb_token = facebookRes.access_token;
      return next();
    }
    return res.status(400).send({
      error: 'unable to extend token'
    });
  });
};

exports.storeUserData = function(req, res, next) {
  var hashedId = require('crypto').createHash('md5').update(req.profileId).digest('hex');
  db.UserAccount.findOne({
    where: {
      hashedId: hashedId
    }
  }).then(function(user) {
    if (!user) {
      db.UserAccount.create({
        profileId: req.profileId,
        hashedId: hashedId,
        firstName: req.firstName,
        lastName: req.lastName,
        birthday: req.birthday,
        gender: req.gender,
        accessToken: req.fb_token
      });
    } else {
      user.update({
        accessToken: req.fb_token
      })
    }
    var encryptedToken = token.generateToken(hashedId);
    return res.status(200).send({
      status: 'success',
      letterbox_token: encryptedToken
    });
  });
};

exports.getUser = function(req, res, next, hashedId) {
  db.UserAccount.findOne({
    where: {
      hashedId: hashedId
    },
    include: [
      {
        model: db.UserWyrQuestion,
        include: db.WyrQuestion
      }
    ]
  }).then(function(user) {
    if (user) {
      req.otherUser = user.get({plain: true});
      return next();
    } else {
      return res.status(404).send({
        error: 'user not found'
      });
    }
  });
};

exports.getSelf = function(req, res) {
  var questions = [];
  for (var i = 0; i < req.user.UserWyrQuestions.length; i++) {
    questions.push(req.user.UserWyrQuestions[i].WyrQuestion);
  }
  return res.send({
    hashedId: req.user.hashedId,
    gender: req.user.gender,
    questions: questions
  });
};

exports.getOtherUser = function(req, res) {
  var questions = [];
  for (var i = 0; i < req.otherUser.UserWyrQuestions.length; i++) {
    questions.push(req.otherUser.UserWyrQuestions[i].WyrQuestion);
  }
  return res.send({
    hashedId: req.otherUser.hashedId,
    gender: req.otherUser.gender,
    questions: questions
  });
};
