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
  // for...in gets the key, not the value
  for (var i = 0; i < req.body.responses.length; i ++) {
    var response = req.body.responses[i];
    for (var j = 0; j < response.choices.length; j ++) {
      var choice = response.choices[j];
      db.SurveyUserAnswer.create({
        user: req.user.hashedId,
        SurveyQuestionId: response.questionId,
        SurveyChoiceId: choice.choiceId
      });
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
