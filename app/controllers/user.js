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
  graph.get('/me?fields=id,first_name,last_name,birthday,gender,picture', function(err, fbResponse) {
    if (!err && fbResponse) {
      req.profileId = fbResponse.id;
      req.firstName = fbResponse.first_name;
      req.lastName = fbResponse.last_name;
      req.birthday = new Date(fbResponse.birthday);
      req.gender = fbResponse.gender;
      req.pictureThumb = fbResponse.picture.data.url
      return next();
    } else {
      return res.status(400).send({
        error: 'invalid facebook access token'
      });
    }   
  });
};

exports.getMediumProfilePicture = function(req, res, next) {
  graph.setAccessToken(req.fb_token);
  graph.get('/me/picture?height=400&width=400', function(err, fbResponse) {
    if (!err && fbResponse) {
      req.pictureMed = fbResponse.location;
      return next();
    } else {
      return res.status(400).send({
        error: 'unable to retrieve medium profile picture'
      })
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
    var isRegistered = false;
    var genderPreference = req.gender === 'male' ? 'female' : 'male';
    if (!user) {
      db.UserAccount.create({
        profileId: req.profileId,
        hashedId: hashedId,
        firstName: req.firstName,
        lastName: req.lastName,
        birthday: req.birthday,
        bio: '',
        pictureThumb: req.pictureThumb,
        pictureMed: req.pictureMed,
        gender: req.gender,
        genderPreference: genderPreference,
        accessToken: req.fb_token
      });
    } else {
      user.update({
        accessToken: req.fb_token
      });
      isRegistered = user.isRegistered;
    }
    var encryptedToken = token.generateToken(hashedId);
    return res.status(200).send({
      status: 'success',
      letterbox_token: encryptedToken,
      user: {
        hashedId: hashedId,
        firstName: req.firstName,
        isRegistered: isRegistered
      }
    });
  });
};

exports.renewToken = function(req, res) {
  var encryptedToken = token.generateToken(req.user.hashedId);
  return res.status(200).send({
    status: 'success',
    letterbox_token: encryptedToken
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

exports.getMatch = function(req, res, next) {
  var maxDistance = Number(req.query.maxDistance);
  var previousId = req.query.previousId;
  var hashedIdCheck;
  if (typeof previousId === 'undefined') {
    hashedIdCheck = {
      $ne: req.user.hashedId
    }
  } else {
    hashedIdCheck = {
      $and: [
        {$ne: req.user.hashedId},
        {$ne: previousId}
      ]
    }
  }
  if (maxDistance > 0) {
    var myLat = req.user.latitude;
    var myLon = req.user.longitude;
    db.UserAccount.findOne({
      attributes: [
        'hashedId',
        [
          db.Sequelize.fn('ABS', db.Sequelize.where(
            db.Sequelize.fn('ACOS',
              db.Sequelize.where(
                db.Sequelize.where(
                  db.Sequelize.fn('cos', db.Sequelize.fn('radians', db.Sequelize.literal(myLat))), '*',
                  db.Sequelize.where(
                    db.Sequelize.fn('cos', db.Sequelize.fn('radians', db.Sequelize.col('latitude'))), '*',
                    db.Sequelize.fn('cos', db.Sequelize.where(
                      db.Sequelize.fn('radians', db.Sequelize.col('longitude')), '-',
                      db.Sequelize.fn('radians', db.Sequelize.literal(myLon))
                    ))
                  )
                ), '+',
                db.Sequelize.where(
                  db.Sequelize.fn('sin', db.Sequelize.fn('radians', db.Sequelize.literal(myLat))), '*',
                  db.Sequelize.fn('sin', db.Sequelize.fn('radians', db.Sequelize.col('latitude')))
                )
              )
            ),
            '*',6371)
          ),
          'distance'
        ]
      ],
      where: {
        hashedId: hashedIdCheck,
        gender: req.user.genderPreference,
        genderPreference: req.user.gender,
        isRegistered: true
      },
      having: [
        'distance <= ?', maxDistance
      ],
      order: [db.Sequelize.fn('RAND')]
    }).then(function(user) {
      if (user) {
        req.matchingUser = user;
        return next();
      } else {
        return res.status(400).send({
          error: 'no match found'
        });
      }
    });
  } else {
    return res.status(400).send({
      error: 'invalid maxDistance'
    });
  }
};

exports.sendMatch = function(req, res) {
  db.UserAccount.findOne({
    where: {
      hashedId: req.matchingUser.hashedId
    },
    include: [
      {
        model: db.UserWyrQuestion,
        include: db.WyrQuestion
      }
    ]
  }).then(function(user) {
    var questions = [];
    for (var i = 0; i < user.UserWyrQuestions.length; i++) {
      questions.push(user.UserWyrQuestions[i].WyrQuestion);
    }
    var age = (new Date()).getYear() - user.birthday.getYear();
    return res.send({
      hashedId: user.hashedId,
      firstName: user.firstName,
      questions: questions,
      bio: user.bio,
      pictureThumb: user.pictureThumb,
      pictureMed: user.pictureMed,
      distance: req.matchingUser.dataValues.distance,
      age: age,
      mutualFriends: []
    });
  });
}

exports.updateLocation = function(req, res) {
  var latitude = req.body.latitude;
  var longitude = req.body.longitude;
  if (isFloat(latitude) && isFloat(longitude)) {
    req.user.update({
      latitude: latitude,
      longitude: longitude
    }).then(function(user) {
      return res.send({
        status: 'success'
      });
    });
  } else {
    return res.status(400).send({
      error: 'invalid coordinates'
    });
  }
};

exports.updateBio = function(req, res) {
  var bio = req.body.bio;
  if (typeof bio === 'string') {
    req.user.update({
      bio: bio
    }).then(function(user) {
      return res.send({
        status: 'success'
      });
    });
  } else {
    return res.status(400).send({
      error: 'invalid bio'
    });
  }
};

exports.updateGender = function(req, res) {
  var validGenders = ['male', 'female'];
  var gender = req.body.gender;
  var genderPreference = req.body.genderPreference;

  if (validGenders.indexOf(gender) > -1 && validGenders.indexOf(genderPreference) > -1) {
    req.user.update({
      gender: gender,
      genderPreference: genderPreference
    }).then(function(user) {
      return res.send({
        status: 'success'
      });
    });
  } else {
    return res.status(400).send({
      error: 'invalid genders'
    });
  }
};

exports.getSelf = function(req, res) {
  var questions = [];
  for (var i = 0; i < req.user.UserWyrQuestions.length; i++) {
    questions.push(req.user.UserWyrQuestions[i].WyrQuestion);
  }
  var age = (new Date()).getYear() - req.user.birthday.getYear();
  return res.send({
    hashedId: req.user.hashedId,
    gender: req.user.gender,
    firstName: req.user.firstName,
    bio: req.user.bio,
    age: age,
    questions: questions,
    pictureThumb: req.user.pictureThumb,
    pictureMed: req.user.pictureMed
  });
};

exports.getOtherUser = function(req, res) {
  var questions = [];
  for (var i = 0; i < req.otherUser.UserWyrQuestions.length; i++) {
    questions.push(req.otherUser.UserWyrQuestions[i].WyrQuestion);
  }
  var age = (new Date()).getYear() - req.otherUser.birthday.getYear();
  return res.send({
    hashedId: req.otherUser.hashedId,
    gender: req.otherUser.gender,
    firstName: req.otherUser.firstName,
    bio: req.otherUser.bio,
    age: age,
    questions: questions,
    pictureThumb: req.otherUser.pictureThumb,
    pictureMed: req.otherUser.pictureMed,
    mutualFriends: []
  });
};

function isFloat(n) {
  return n === Number(n) && n % 1 !== 0;
}
