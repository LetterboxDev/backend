var userController = require('../controllers/user');
var letterController = require('../controllers/letter');

exports.init = function(app) {
  app.get('/letters', userController.requireAuthentication, letterController.getLetters);
  app.get('/letters/all', userController.requireAuthentication, letterController.getAllLetters);
  app.get('/letters/sender/:userHash', userController.requireAuthentication, letterController.getLetterFromSender);
  app.post('/letters', userController.requireAuthentication, letterController.getRecipient, letterController.checkLetterHashExists, letterController.createLetter, letterController.checkPerfectMatch, letterController.sendLetter);
  app.post('/letters/:letterHash', userController.requireAuthentication, letterController.approveLetter);
  app.delete('/letters/:letterHash', userController.requireAuthentication, letterController.rejectLetter);
  app.put('/letters/:letterHash', userController.requireAuthentication, letterController.readLetter);

  app.param('letterHash', letterController.getLetter);
  app.param('userHash', userController.getUser);
}
