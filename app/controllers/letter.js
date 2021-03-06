/**
 *  Letter controller
 */
var db = require('../../config/sequelize');

// put letter into req object
exports.getLetter = function(req, res, next, hash) {
  db.Letter.findOne({
    where: {
      hash: hash,
      recipient: req.user.hashedId
    }
  }).then(function(letter) {
    req.letter = letter;
    return next();
  });
};

// Get all letters sent to the user
exports.getLetters = function(req, res) {
  db.Letter.findAll({
    where: {
      recipient: req.user.hashedId,
      isApproved: false,
      isRejected: false
    },
    include: [{
      model: db.LetterAnswer,
      include: db.WyrQuestion
    },{
      model: db.UserAccount,
      attributes: ['hashedId', 'firstName', 'gender', 'birthday', 'bio', 'pictureThumb', 'pictureMed']
    }],
    order: [['createdAt', 'DESC']]
  }).then(function(letters) {
    return res.send(letters);
  })
};

/**
 * Request body:
 * {
 *   recipient: STRING,
 *   questions: [  
 *     {
 *       id: INT,
 *       answer: BOOLEAN (option0: false, option1: true)
 *     },
 *     ...
 *   ]
 * }
 */

var createAnswersRecursively = function(letterHash, questions, index, promise) {
  if (index < 5) {
    db.LetterAnswer.create({
      answer: questions[index].answer,
      LetterHash: letterHash,
      WyrQuestionId: questions[index].id,
      isCorrect: questions[index].isCorrect
    }).then(function(answer) {
      return createAnswersRecursively(letterHash, questions, index+1, promise);
    });
  } else {
    return promise();
  }
};

exports.createLetter = function(req, res, next) {
  var questions = req.body.questions;
  if (questions instanceof Array && questions.length === 5) {
    db.Letter.create({
      hash: req.letterHash,
      UserAccountHashedId: req.user.hashedId,
      recipient: req.recipient.hashedId
    }).then(function(letter) {
      req.letter = letter;
      createAnswersRecursively(req.letterHash, questions, 0, function() {
        next();
      });
    });
  } else {
    return res.status(400).send({
      error: 'invalid questions length'
    });
  }
};

exports.checkPerfectMatch = function(req, res, next) {
  var recipientQuestions = req.recipient.UserWyrQuestions;
  var replyAnswers = req.body.questions;
  req.isPerfectMatch = true;
  for (var i = 0; i < recipientQuestions.length; i++) {
    var question = recipientQuestions[i];
    for (var j = 0; j < replyAnswers.length; j++) {
      var replyAnswer = replyAnswers[i];
      if (question.WyrQuestionId === replyAnswer.id) {
        replyAnswer.isCorrect = question.answer === replyAnswer.answer;
        if (!replyAnswer.isCorrect) {
          req.isPerfectMatch = false;
        }
        break;
      }
    }
  }
  return next();
};

exports.sendLetter = function(req, res) {
  if (!req.recipient.perfectMatch || req.isPerfectMatch) {
    require('../sockets/notifier').notifyOfLetter(req.recipient.hashedId, req.letterHash);
  } else {
    req.letter.update({isRead: true, isRejected: true});
  }
  return res.send({
    status: 'success'
  });
};

exports.checkLetterHashExists = function(req, res, next) {
  var hash = db.Letter.generateLetterHash(req.user.hashedId, req.recipient.hashedId);
  db.Letter.findOne({
    where: {
      hash: hash      
    }
  }).then(function(letter) {
    if (!letter) {
      req.letterHash = hash;
      return next();
    } else {
      return res.status(400).send({
        error: 'letter already exists between users'
      });
    }
  });
}

exports.getRecipient = function(req, res, next) {
  db.UserAccount.findOne({
    where: {
      hashedId: req.body.recipient,
      gender: req.user.genderPreference,
      genderPreference: req.user.gender
    },
    include: [{model: db.UserWyrQuestion}]
  }).then(function(user) {
    if (user && user.hashedId !== req.user.hashedId) {
      req.recipient = user;
      return next();
    } else {
      return res.status(400).send({
        error: 'invalid recipient'
      });
    }
  });
};

exports.checkIsLatestMatch = function(req, res, next) {
  db.Match.findOne({
    where: {
      matcherHashedId: req.user.hashedId
    },
    order: [['createdAt', 'DESC']]
  }).then(function(match) {
    if (!match || match.matcheeHashedId !== req.recipient.hashedId) {
      return res.status(400).send({
        error: 'no longer latest match'
      });
    } else {
      return next();
    }
  });
};

exports.approveLetter = function(req, res) {
  if (req.letter.recipient === req.user.hashedId && !req.letter.isApproved && !req.letter.isRejected) {
    req.letter.update({
      isRead: true,
      isApproved: true
    }).then(function(letter) {
      var roomHash = db.Room.generateRoomHash(req.user.hashedId, req.letter.UserAccountHashedId);
      db.Room.findOne({
        where: {
          hash: roomHash
        }
      }).then(function(room) {
        if (!room) {
          var letterRecipient = req.user.hashedId;
          var letterSender = req.letter.UserAccountHashedId;
          db.Room.create({
            hash: roomHash,
            user1: letterRecipient < letterSender ? letterRecipient : letterSender,
            user2: letterRecipient > letterSender ? letterRecipient : letterSender,
            LetterHash: letter.hash
          }).then(function(room) {
            require('../sockets/notifier').notifyOfRoom(req.letter.UserAccountHashedId, room, req.user);
            return res.send(room);
          });
        } else {
          return res.status(400).send({
            error: 'room already exists',
            room: room
          });
        }
      });
    });
  } else {
    return res.status(401).send({
      error: 'unauthorized'
    });
  }
};

exports.rejectLetter = function(req, res) {
  if (req.letter.recipient === req.user.hashedId && !req.letter.isApproved && !req.letter.isRejected) {
    req.letter.update({
      isRead: true,
      isRejected: true
    }).then(function(letter) {
      return res.send({
        status: 'success'
      });
    });
  } else {
    return res.status(401).send({
      error: 'unauthorized'
    });
  }
};

exports.readLetter = function(req, res) {
  req.letter.update({
    isRead: true
  }).then(function(letter) {
    return res.send({
      status: 'success'
    });
  })
};
