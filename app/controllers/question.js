/**
 *  Question controller
 */
var db = require('../../config/sequelize');

exports.getQuestion = function(req, res) {
  db.ProfileQuestion.findOne({
    where: {
      owner: req.user.hashedId
    },
    order: [
      ['updatedAt', 'DESC']
    ]
  }).then(function(question) {
    if (!question) {
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

exports.postQuestion = function(req, res) {
  var question = req.body.question;
  var owner;

  // Create a new profile question associated with the owner
  db.ProfileQuestion.create({
    owner: req.user.hashedId,
    question: question
  }).then(function(question) {
    return res.send(question);
  });
};

exports.getOtherUserQuestion = function(req, res) {
  if (req.question.owner !== req.user.hashedId) {
    return res.send(req.question);
  } else {
    return res.status(400).send('unable to access own question, use /question/self');
  }
};

exports.extractUserQuestion = function(req, res, next, hashedId) {
  db.UserAccount.findOne({where: {hashedId: hashedId}}).then(function(user) {
    if (user) {
      db.ProfileQuestion.findOne({
        where: {
          owner: hashedId
        },
        order: [
          ['updatedAt', 'DESC']
        ]
      }).then(function(question) {
        if (!question) {
          return res.status(400).send({
            status: 'Cannot find active user profile question'
          });
        } else {
          req.question = question;
          return next();
        }
      });
    } else {
      return res.status(400).send({
        status: 'User does not exist'
      });
    }
  });
};
