/**
 * User controller
 */

var jwt = require('jsonwebtoken');

exports.init = function(app) {
  app.get('/auth', function(req, res) {
    if (typeof req.query.fb_token != 'undefined') {
      var token = jwt.sign({fb_token: req.query.fb_token}, 'testkey');
      res.send({
        access_token: token,
        fb_token: req.query.fb_token
      });
    } else {
      res.status(500).send({
        error: 'invalid params'
      });
    }
  });

  app.get('/check', function(req, res) {
    if (typeof req.query.token != 'undefined') {
      var decoded = jwt.verify(req.query.token, 'testkey');
      res.send(decoded);
    } else {
      res.status(500).send({
        error: 'invalid params'
      });
    }
  });
}