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
    next();
  } else {
    return res.status(400).send({
      error: req.authentication.message
    });
  }
}

exports.checkFacebookTokenParam = function(req, res, next) {
  if (typeof req.query.fb_token !== 'undefined') {
    req.fb_token = req.query.fb_token;
    next();
  } else {
    res.status(400).send({
      error: 'invalid params, fb_token required'
    });
  }
}

exports.validateFacebookToken = function(req, res, next) {
  graph.setAccessToken(req.fb_token);
  graph.get('/me?fields=id,gender', function(err, fbResponse) {
    if (!err && fbResponse) {
      req.profileId = fbResponse.id;
      req.gender = fbResponse.gender;
      return next();
    } else {
      return res.status(400).send({
        error: 'invalid facebook access token'
      });
    }   
  });
}

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
}

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
        gender: req.gender,
        accessToken: req.fb_token
      });
    } else {
      user.update({
        accessToken: req.fb_token
      })
    }
    var encryptedToken = token.generateToken(hashedId);
    res.cookie('letterbox_token', encryptedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
    return res.status(200).send({
      status: 'success'
    });
  });
}

exports.check = function(req, res) {
  return res.send({
    status: 'valid user',
    user: req.user
  });
}

exports.logout = function(req, res) {
  res.clearCookie('letterbox_token');
  return res.send({
    status: 'successfully logged out',
    user: req.user
  });
}

exports.getSimilarityIndexWithOtherUser = function(req, res) {
  if (req.user.hashedId === req.params.otherUserHashedId) {
    return res.status(200).send({
      similarity: '1.000'
    });
  }

  db.SurveyUserAnswer.findAndCountAll({
    attributes: ['user', 'SurveyChoiceId'],
    where: {
      user: {
        in: [req.user.hashedId, req.params.otherUserHashedId]
      }
    },
    order: 'user'
  }).then(function(result) {
    var numberOfAnswers = result.count;
    if (result.count === 0) {
      return res.status(200).send({
        similarity: '0.000'
      });
    }

    // storing first user's answers in a set for fast access and compare later
    var firstUserAnswersSet = {};
    var firstUserId = result.rows[0].user;
    var numberOfSameRecord = 0;
    result.rows.forEach(function(answer) {
      if (answer.user === firstUserId) {
        firstUserAnswersSet[answer.SurveyChoiceId] = 1;
      } else {
        if (typeof firstUserAnswersSet[answer.SurveyChoiceId] !== 'undefined') {
          numberOfSameRecord ++;
        }
      }
    });

    return res.status(200).send({
      similarity: (numberOfSameRecord / (numberOfAnswers - numberOfSameRecord)).toFixed(3)
    });
  });
}
