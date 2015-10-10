var path = require('path');
var rootPath = path.normalize(__dirname + '/..');
var modelsPath = rootPath + '/app/models';
var mysqlPassword = process.env.MYSQL_PASSWORD;

module.exports = {
  development: {
    db: {
      name: "letterbox",
      username: "root",
      password: "admin",
      host: "localhost",
      port: 3306
    }
  },
  production: {
    db: {
      name: "letterbox",
      username: "root",
      password: mysqlPassword,
      host: "localhost",
      port: 3306
    }
  },
  rootPath: rootPath,
  modelsPath: modelsPath
}
