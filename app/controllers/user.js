/**
 * User controller
 */

var config = require('../../config/config');
var token = require('../../config/token');
var db = require('../../config/sequelize');
var graph = require('fbgraph');

var getDistanceMatchAttributes = function(myLat, myLon) {
  return [
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
  ];
};

var getHashedIdCheckClause = function(userHashedId, previousId) {
  if (typeof previousId === 'undefined') {
    return {
      $ne: userHashedId
    };
  } else {
    return {
      $and: [
        {$ne: userHashedId},
        {$ne: previousId}
      ]
    };
  }
};

var degToRad = function(deg) {
  return deg * Math.PI / 180;
};

var getDistanceBetweenUsers = function(user1, user2) {
  return Math.abs(
    6371 * Math.acos(
      Math.cos(degToRad(user1.latitude))*Math.cos(degToRad(user2.latitude))*Math.cos(degToRad(user2.longitude)-degToRad(user1.longitude))+
      Math.sin(degToRad(user1.latitude))*Math.sin(degToRad(user2.latitude))
    )
  );
};

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
  graph.setAppSecret(process.env.FACEBOOK_APP_SECRET);
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
  graph.setAppSecret(process.env.FACEBOOK_APP_SECRET);
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
  graph.setAppSecret(process.env.FACEBOOK_APP_SECRET);
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
      }).then(function(user) {
        var encryptedToken = token.generateToken(hashedId);
        return res.status(200).send({
          status: 'success',
          letterbox_token: encryptedToken,
          user: {
            hashedId: hashedId,
            firstName: user.firstName,
            isRegistered: user.isRegistered,
            genderPreference: user.genderPreference,
            perfectMatch: user.perfectMatch
          }
        });
      });
    } else {
      user.update({
        accessToken: req.fb_token,
        firstName: req.firstName,
        lastName: req.lastName,
        birthday: req.birthday,
        gender: req.gender
      }).then(function(user) {
        var encryptedToken = token.generateToken(hashedId);
        return res.status(200).send({
          status: 'success',
          letterbox_token: encryptedToken,
          user: {
            hashedId: hashedId,
            firstName: user.firstName,
            isRegistered: user.isRegistered,
            genderPreference: user.genderPreference,
            perfectMatch: user.perfectMatch
          }
        });
      });
    }
  });
};

exports.setRenewVars = function(req, res, next) {
  req.fb_token = req.user.accessToken;
  return next();
};

exports.renewToken = function(req, res) {
  req.user.update({
    firstName: req.firstName,
    lastName: req.lastName,
    birthday: req.birthday,
    gender: req.gender,
    accessToken: req.fb_token
  }).then(function(user) {
    var encryptedToken = token.generateToken(req.user.hashedId);
    return res.status(200).send({
      status: 'success',
      letterbox_token: encryptedToken,
      user: {
        hashedId: user.hashedId,
        firstName: user.firstName,
        isRegistered: user.isRegistered,
        genderPreference: user.genderPreference,
        perfectMatch: user.perfectMatch
      }
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

function getMinBirthday(maxAge) {
  var minBirthday = new Date();
  minBirthday.setYear((new Date()).getYear() - maxAge);
  minBirthday.setMonth(0);
  minBirthday.setDate(1);
  minBirthday.setHours(0);
  minBirthday.setMinutes(0);
  minBirthday.setSeconds(0);
  minBirthday.setMilliseconds(0);
  return minBirthday;
}

function getMaxBirthday(minAge) {
  var maxBirthday = new Date();
  maxBirthday.setYear((new Date()).getYear() - minAge);
  maxBirthday.setMonth(11);
  maxBirthday.setDate(31);
  maxBirthday.setHours(23);
  maxBirthday.setMinutes(59);
  maxBirthday.setSeconds(59);
  maxBirthday.setMilliseconds(999);
  return maxBirthday;
}

exports.getMatch = function(req, res, next) {
  var maxDistance = Number(req.query.maxDistance);
  var previousId = req.query.previousId;
  var maxBirthday = getMaxBirthday(req.query.minAge ? req.query.minAge : 18);
  var minBirthday = getMinBirthday(req.query.maxAge ? req.query.maxAge : 80);
  var hashedIdCheck = getHashedIdCheckClause(req.user.hashedId, previousId);
  if (maxDistance > 0) {
    var myLat = req.user.latitude;
    var myLon = req.user.longitude;
    var oneMonthAgo = new Date(Date.now() - 2628000000);
    db.UserAccount.findOne({
      attributes: getDistanceMatchAttributes(myLat, myLon),
      where: {
        birthday: {
          $and: [
            {$gt: minBirthday},
            {$lt: maxBirthday}
          ]
        },
        hashedId: hashedIdCheck,
        gender: req.user.genderPreference,
        genderPreference: req.user.gender,
        isRegistered: true,
        $and: [
          ['`hashedId` NOT IN (SELECT `recipient` FROM `Letters` WHERE `UserAccountHashedId`=?)', req.user.hashedId],
          ['`hashedId` NOT IN (SELECT `UserAccountHashedId` FROM `Letters` WHERE `recipient`=?)', req.user.hashedId],
          ['`hashedId` NOT IN (SELECT `reportee` FROM `Reports` WHERE `reporter`=?)', req.user.hashedId]
        ]
      },
      having: ['distance <= ?', maxDistance],
      order: [db.Sequelize.fn('RAND')]
    }).then(function(user) {
      if (user) {
        req.matchingUser = user;
        return next();
      } else {
        return res.send({
          code: 100,
          status: 'no match found'
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
    graph.setAppSecret(process.env.FACEBOOK_APP_SECRET);
    graph.setAccessToken(req.user.accessToken);
    graph.get('/' + user.profileId + '?fields=context.fields%28mutual_friends%29', function(err, fbResponse) {
      if (!err && fbResponse) {
        return res.send({
          code: 200,
          status: 'match found',
          hashedId: user.hashedId,
          firstName: user.firstName,
          questions: questions,
          bio: user.bio,
          pictureThumb: user.pictureThumb,
          pictureMed: user.pictureMed,
          distance: req.matchingUser.dataValues.distance,
          age: age,
          mutualFriends: fbResponse.context.mutual_friends
        });
      } else {
        return res.send({
          code: 200,
          status: 'match found',
          hashedId: user.hashedId,
          firstName: user.firstName,
          questions: questions,
          bio: user.bio,
          pictureThumb: user.pictureThumb,
          pictureMed: user.pictureMed,
          distance: req.matchingUser.dataValues.distance,
          age: age,
          mutualFriends: undefined
        });
      }
    });
  });
}

exports.getMultipleMatches = function(req, res, next) {
  var maxDistance = Number(req.query.maxDistance);
  var limit = Number(req.query.limit);
  var previousId = req.query.previousId;
  var hashedIdCheck = getHashedIdCheckClause(req.user.hashedId, previousId);
  if (limit > 0) {
    if (maxDistance > 0) {
      var myLat = req.user.latitude;
      var myLon = req.user.longitude;
      var oneMonthAgo = new Date(Date.now() - 2628000000);
      db.UserAccount.findAll({
        attributes: getDistanceMatchAttributes(myLat, myLon),
        where: {
          hashedId: hashedIdCheck,
          gender: req.user.genderPreference,
          genderPreference: req.user.gender,
          isRegistered: true,
          $and: [['`hashedId` NOT IN (SELECT `recipient` FROM `Letters` WHERE `UserAccountHashedId`=? AND (`createdAt`>? OR `isApproved`=1 OR `isRejected`=1))', req.user.hashedId, oneMonthAgo]]
        },
        having: ['distance <= ?', maxDistance],
        order: [db.Sequelize.fn('RAND')],
        limit: limit
      }).then(function(users) {
        if (users.length !== 0) {
          var matches = [];
          for (var i = 0; i < users.length; i++) {
            var user = users[i];
            matches.push(user.hashedId);
          }
          req.matches = matches;
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
  } else {
    return res.status(400).send({
      error: 'invalid limit'
    });
  }
};

exports.sendMultipleMatches = function(req, res) {
  db.UserAccount.findAll({
    where: {
      hashedId: {$in: req.matches}
    },
    include: [{
      model: db.UserWyrQuestion,
      include: db.WyrQuestion
    }],
    order: [db.Sequelize.fn('RAND')]
  }).then(function(users) {
    var matchedUsers = [];
    for (var j = 0; j < users.length; j++) {
      var user = users[j];
      var questions = [];
      for (var i = 0; i < user.UserWyrQuestions.length; i++) {
        questions.push(user.UserWyrQuestions[i].WyrQuestion);
      }
      var age = (new Date()).getYear() - user.birthday.getYear();
      matchedUsers.push({
        hashedId: user.hashedId,
        firstName: user.firstName,
        questions: questions,
        bio: user.bio,
        pictureThumb: user.pictureThumb,
        pictureMed: user.pictureMed,
        distance: getDistanceBetweenUsers(req.user, user),
        age: age,
        mutualFriends: []
      });
    }
    return res.send(matchedUsers);
  });
};

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

exports.updateGenderPreference = function(req, res) {
  var validGenders = ['male', 'female'];
  var genderPreference = req.body.genderPreference;

  if (validGenders.indexOf(genderPreference) > -1) {
    req.user.update({
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
    var question = req.user.UserWyrQuestions[i].WyrQuestion.get({plain: true});
    question.answer = req.user.UserWyrQuestions[i].answer;
    questions.push(question);
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
    pictureMed: req.user.pictureMed,
    perfectMatch: req.user.perfectMatch
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

exports.setPushToken = function(req, res) {
  if (typeof req.body.pushToken === 'string') {
    req.user.update({
      pushToken: req.body.pushToken
    }).then(function(user) {
      return res.send({
        status: 'success'
      });
    });
  } else {
    return res.status(400).send({
      error: 'invalid token'
    });
  }
};

exports.clearPushToken = function(req, res) {
  req.user.update({
    pushToken: null
  }).then(function(user) {
    return res.send({
      status: 'success'
    });
  });
};

exports.getProfilePhotoAlbum = function(req, res, next) {
  graph.setAppSecret(process.env.FACEBOOK_APP_SECRET);
  graph.setAccessToken(req.user.accessToken);
  graph.get('/me/albums', function(err, fbResponse) {
    if (!err && fbResponse.data) {
      var albums = fbResponse.data;
      for (var i = 0; i < albums.length; i++) {
        var album = albums[i];
        if (album.name === 'Profile Pictures') {
          req.album = album;
          return next();
        }
      }
      return res.status(400).send({
        error: 'unable to get Profile Pictures album'
      });
    } else {
      return res.status(400).send({
        error: 'unable to get albums'
      });
    }
  });
};

exports.getProfilePhotos = function(req, res) {
  var albumId = req.album.id;
  graph.setAppSecret(process.env.FACEBOOK_APP_SECRET);
  graph.setAccessToken(req.user.accessToken);
  graph.get(albumId + '/photos?fields=picture', function(err, fbResponse) {
    if (!err && fbResponse.data) {
      return res.send(fbResponse.data);
    } else {
      return res.status(400).send({
        error: 'unable to get photos from album'
      });
    }
  });
};

exports.checkPictureId = function(req, res, next) {
  if (typeof req.body.id !== 'undefined') {
    graph.setAppSecret(process.env.FACEBOOK_APP_SECRET);
    graph.setAccessToken(req.user.accessToken);
    graph.get(req.body.id + '?fields=picture,from', function(err, fbResponse) {
      if (!err && fbResponse && fbResponse.from.id === req.user.profileId) {
        req.thumbnail = fbResponse.picture;
        return next();
      } else {
        return res.status(400).send({
          error: 'invalid picture id'
        });
      }
    });
  } else {
    return res.status(400).send({
      error: 'no picture id provided'
    });
  }
};

exports.getMediumPhoto = function(req, res, next) {
  graph.setAppSecret(process.env.FACEBOOK_APP_SECRET);
  graph.setAccessToken(req.user.accessToken);
  graph.get(req.body.id + '/picture', function(err, fbResponse) {
    if (!err && fbResponse && fbResponse.location) {
      req.medium = fbResponse.location;
      return next();
    } else {
      return res.status(400).send({
        error: 'unable to get medium sized picture',
        fbErr: err,
        fbResponse: fbResponse
      });
    }
  });
};

exports.updateProfilePhoto = function(req, res) {
  req.user.update({
    pictureThumb: req.thumbnail,
    pictureMed: req.medium
  }).then(function(user) {
    return res.send({
      status: 'success',
      pictureMed: user.pictureMed,
      pictureThumb: user.pictureThumb
    });
  });
};

exports.setPerfectMatch = function(req, res) {
  if (typeof req.body.perfectMatch !== 'undefined') {
    req.user.update({
      perfectMatch: req.body.perfectMatch
    }).then(function(user) {
      return res.send({
        status: 'success',
        perfectMatch: user.perfectMatch
      });
    });
  } else {
    return res.status(400).send({
      error: 'invalid request body'
    });
  }
};

exports.getOtherUserVersion = function(req, res) {
  return res.send({
    major: req.otherUser.versionMajor,
    minor: req.otherUser.versionMinor,
    revision: req.otherUser.versionRevision,
    version: req.otherUser.versionMajor + "." + req.otherUser.versionMinor + "." + req.otherUser.versionRevision
  });
};

exports.setVersion = function(req, res) {
  if (typeof req.body.major !== 'undefined' && typeof req.body.minor !== 'undefined' && typeof req.body.revision !== 'undefined') {
    req.user.update({
      versionMajor: req.body.major,
      versionMinor: req.body.minor,
      versionRevision: req.body.revision
    }).then(function(user) {
      return res.send({
        status: 'success',
        major: user.versionMajor,
        minor: user.versionMinor,
        revision: user.versionRevision,
        version: user.versionMajor + "." + user.versionMinor + "." + user.versionRevision
      }); 
    });
  } else {
   return res.status(400).send({
      error: 'invalid request body'
    }); 
  }
};

function isFloat(n) {
  return n === Number(n) && n % 1 !== 0;
}
