var mongoose = require('mongoose');
var fs = require('fs');
var config = require('./config');
var env = config[process.env.NODE_ENV || 'development'];
var db = mongoose.createConnection(env.db);
var _ = require('lodash');

db.on('error', console.error.bind(console, 'error connecting to MongoDB:'));
db.on('connected', function(){
  console.log('DB: ' + env.db + ' connected!');

  var modelFiles = fs.readdirSync(config.modelsPath);

  modelFiles.forEach(function (file) {
    require(config.modelsPath + '/' + file);
    console.log("Added model: " + file);
  }); 
});

module.exports = db;