/**
 *  Report controller
 */
var db = require('../../config/sequelize');

exports.findUser = function(req, res, next) {
  if (typeof req.body.userId !== 'undefined' && req.body.userId !== req.user.hashedId) {
    db.UserAccount.findOne({
      where: {
        hashedId: req.body.userId
      }
    }).then(function(user) {
      if (user) {
        req.reportee = user;
        return next();
      } else {
        return res.status(404).send({
          error: 'user not found'
        });
      }
    });
  } else {
    return res.status(400).send({
      error: 'invalid body'
    });
  }
};

exports.reportUser = function(req, res) {
  if (typeof req.body.reason !== 'undefined') {
    db.Report.create({
      reportee: req.reportee.hashedId,
      reporter: req.user.hashedId,
      reason: req.body.reason
    }).then(function(report) {
      return res.send({
        status: 'success'
      });
    });
  } else {
    return res.status(400).send({
      error: 'Report requires reason'
    });
  }
};
