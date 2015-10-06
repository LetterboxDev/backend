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

exports.putWyrSet = function(req, res) {
  var questionIds = req.body.question_ids;
  if (questionIds instanceof Array && questionIds.length === 5) {
    var prev;
    questionIds.sort();
    for (var i = 0; i < questionIds.length; i++) {
      if (typeof questionIds[i] !== 'number') {
        questionIds[i] = parseInt(questionIds[i]);
      }
      if (questionIds[i] === prev) {
        return res.status(400).send({
          error: 'repetition in id'
        });
      }
      prev = questionIds[i];
    }
    db.UserWyrQuestion.destroy({
      where: {
        UserAccountHashedId: req.user.hashedId
      }
    });
    for (var i = 0; i < questionIds.length; i++) {
      db.UserWyrQuestion.create({
        UserAccountHashedId: req.user.hashedId,
        WyrQuestionId: questionIds[i]
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
