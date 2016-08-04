var sha1 = require('sha1');
var mongoose = require('mongoose');
var variables = require('../db');

var db = mongoose.connect(variables.url, function (error) {
  if (error) {
    console.log(error);
  }
});

var Schema = mongoose.Schema;
var UserSchema = new Schema({
  firstName : String ,
  lastName : String ,
  email : String,
  passwordHash : String
});

//UserSchema.prototype.getFullName = function() {
//  return this.firstName + ' ' + this.lastName;
//}

var User = mongoose.model('users', UserSchema);

//var newUser = User(createUserObject('tori', 'solorzano', 'victoriatrash@gmail.com', 'idodriving'));

// TODO: createUser 1) does user with this email already exist???
var newUser = User(createUserObject('bobby', 'jones', 'test@test.com', 'test'));
newUser.save(function(err) {
  if (!err) {
    db.disconnect();
  }
});


function createUserObject(firstName, lastName, email, password) {
  var passwordHash = sha1(password);
  return {
    firstName: firstName,
    lastName: lastName,
    email: email,
    passwordHash: passwordHash
  }
}



