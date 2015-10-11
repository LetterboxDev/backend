/**
 *  WYR Question controller
 */
var db = require('../../config/sequelize');

exports.getRandomQuestions = function(req, res) {
  db.WyrQuestion.findAll({
    order: [
      db.Sequelize.fn('RAND')
    ],
    limit: 5
  }).then(function(questions) {
    return res.send(questions);
  });
};

exports.getOneRandomQuestion = function(req, res) {
  var currentIds = req.query.currentQuestionIds;
  if (currentIds !== 'undefined' && currentIds.constructor === Array) {
    db.WyrQuestion.findOne({
      where: {
        id: {
          $notIn: currentIds
        }
      },
      order: [
        db.Sequelize.fn('RAND')
      ]
    }).then(function(question) {
      return res.send(question);
    });
  } else {
    db.WyrQuestion.findOne({
      order: [
        db.Sequelize.fn('RAND')
      ]
    }).then(function(question) {
      return res.send(question);
    });
  }
};

/**
 * Request body:
 * {
 *   questions: [  
 *     {
 *       questionId: INT,
 *       answer: BOOLEAN (option0: false, option1: true)
 *     },
 *     ...
 *   ]
 * }
 */
exports.putUserWyrQuestions = function(req, res) {
  var questions = req.body.questions;
  if (questions instanceof Array && questions.length === 5) {
    var prev;
    questions.sort(function(questionA, questionB) {
      return questionA.questionId - questionB.questionId;
    });
    for (var i = 0; i < questions.length; i++) {
      if (questions[i].questionId === prev) {
        return res.status(400).send({
          error: 'repetition in id'
        });
      }
      prev = questions[i].questionId;
    }
    db.UserWyrQuestion.destroy({
      where: {
        UserAccountHashedId: req.user.hashedId
      }
    });
    for (var i = 0; i < questions.length; i++) {
      db.UserWyrQuestion.create({
        UserAccountHashedId: req.user.hashedId,
        WyrQuestionId: questions[i].questionId,
        answer: questions[i].answer
      });
    }
    return res.send({
      status: 'success'
    });
  } else {
    return res.status(400).send({
      error: 'invalid request'
    });
  }
};
