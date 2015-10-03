/**
 *  Survey controller
 */
var db = require('../../config/sequelize');

exports.getAll = function(req, res) {
  db.SurveyQuestion.findAll({
    order: [['id', 'ASC']],
    include: [{
      model: db.SurveyChoice
    }]
  }).then(function(questions) {
    return res.status(200).send(questions);
  });
};

exports.getOnboarding = function(req, res) {
  db.SurveyQuestion.findAll({
    where: {
      isRequired: true
    },
    order: [['id', 'ASC']],
    include: [{
      model: db.SurveyChoice
    }]
  }).then(function(questions) {
    return res.status(200).send(questions);
  });
};

exports.postResponses = function(req, res) {
  for (response in req.body.responses) {
    for (choice in response.choices) {
      db.SurveyUserAnswer.create({
        user: req.user.hashedId,
        SurveyQuestionId: response.questionId,
        SurveyChoiceId: choice.choiceId
      })
    }
  }
  return res.status(200).send({status: 'responses posted'});
};

exports.getOnboardingResponses = function(req, res) {
  db.SurveyQuestion.findAll({
    where: {
      isRequired: true
    },
    order: [['id', 'ASC']],
    include: [{
      model: db.SurveyUserAnswer
    }]
  }).then(function(questions) {
    return res.status(200).send(questions);
  });
};

exports.getAllResponses = function(req, res) {
  db.SurveyQuestion.findAll({
    order: [['id', 'ASC']],
    include: [{
      model: db.SurveyUserAnswer
    }]
  }).then(function(questions) {
    return res.status(200).send(questions);
  });
};
