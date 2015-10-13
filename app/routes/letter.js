var userController = require('../controllers/user');
var letterController = require('../controllers/letter');

exports.init = function(app) {
  app.get('/letters', userController.requireAuthentication, letterController.getLetters);
  app.post('/letters', userController.requireAuthentication, letterController.getRecipient, letterController.checkLetterHashExists, letterController.createLetter);
  app.post('/letters/:letterHash', userController.requireAuthentication, letterController.approveLetter);
  app.put('/letters/:letterHash', userController.requireAuthentication, letterController.readLetter);

  app.param('letterHash', letterController.getLetter);
}
