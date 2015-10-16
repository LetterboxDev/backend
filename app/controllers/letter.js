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
      recipient: req.user.hashedId
    },
    include: [{
      model: db.LetterAnswer,
      include: db.WyrQuestion
    },{
      model: db.UserAccount,
      attributes: ['firstName', 'birthday', 'bio', 'pictureThumb', 'pictureMed']
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
      WyrQuestionId: questions[index].id
    }).then(function(answer) {
      return createAnswersRecursively(letterHash, questions, index+1, promise);
    });
  } else {
    return promise();
  }
};

exports.createLetter = function(req, res) {
  var questions = req.body.questions;
  if (questions instanceof Array && questions.length === 5) {
    db.Letter.create({
      hash: req.letterHash,
      UserAccountHashedId: req.user.hashedId,
      recipient: req.recipient.hashedId
    }).then(function(letter) {
      req.letter = letter;
      createAnswersRecursively(req.letterHash, questions, 0, function() {
        require('../sockets/notifier').notifyOfLetter(req.recipient.hashedId, req.letterHash);
        return res.send({
          status: 'success'
        });
      });
    });
  } else {
    return res.status(400).send({
      error: 'invalid questions length'
    });
  }
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
      hashedId: req.body.recipient
    }
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

exports.approveLetter = function(req, res) {
  if (req.letter.recipient === req.user.hashedId) {
    req.letter.update({
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
            user2: letterRecipient > letterSender ? letterRecipient : letterSender
          }).then(function(room) {
            require('../sockets/notifier').notifyOfRoom(req.letter.UserAccountHashedId, room);
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

exports.readLetter = function(req, res) {
  req.letter.update({
    isRead: true
  }).then(function(letter) {
    return res.send({
      status: 'success'
    });
  })
};
