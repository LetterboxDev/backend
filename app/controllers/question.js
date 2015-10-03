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
