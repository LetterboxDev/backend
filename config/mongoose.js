var mongoose = require('mongoose'),
    fs = require('fs'),
    config = require('./config'),
    env = config[process.env.NODE_ENV || 'development'],
    db = mongoose.createConnection(env.db),
    _ = require('lodash');

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