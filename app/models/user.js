// User schema
var db = require('../../config/mongoose'),
		mongoose = require('mongoose'),
		Schema = mongoose.Schema;
  
var UserSchema = new Schema({
	profileId: {type : String},
	hashedId: {type : String},
	gender: {type : String},
	accessToken: {type : String},
	createdAt  : {type : Date, default : Date.now}
});

UserSchema.path('profileId').validate(function (profileId) {
  return profileId !== null;
}, 'profileId must not be null');

UserSchema.path('hashedId').validate(function (hashedId) {
  return hashedId !== null;
}, 'hashedId must not be null');

var model = db.model('Users', UserSchema);
module.exports = model;