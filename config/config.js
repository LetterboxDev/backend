var path = require('path');
var rootPath = path.normalize(__dirname + '/..');
var modelsPath = rootPath + '/app/models';

module.exports = {
  development: {
    db: 'mongodb://localhost:27017/Letterbox'
  },
  production: {
    db: '<INSERT_DB_PATH_HERE>'
  },
  rootPath: rootPath,
  modelsPath: modelsPath
}
