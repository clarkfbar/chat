
/*
 * GET users listing.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var id = 1000;

var url = 'mongodb://localhost:3001/chat';

mongoose.connect(url, function(err, db) {
  if(!err) {
      console.log("connect correctly to server");
  } else {
    console.log(err);
  }
});

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  icon: String
});

var Users = mongoose.model('users', userSchema);

exports.login = function (username, password, callback) {
  var query = Users.find({username: username}, function(err, user) {
    console.log(user.length);
    if(user.length > 0 && user[0].password == password) {
      callback(true, user[0].username, user[0].icon);
    } else {
      callback(false);
    }
  });
}

exports.registerUser = function (username, password, icon, callback) {
  usernameAvailable(username, function(err, user){
    if(user.length == 0) {
      var user = new Users({username: username, password: password, icon: icon});
      user.save(function(err, user) {
        if(err) {
          console.log("Fail to save username %s", username);
          callback(false);
        } else {
          console.log("Successly save username %s", username);
          callback(true);
        }
      });
    } else {
      console.log("Fail to save username %s", username);
      callback(false);
    }
  })
};

exports.getUserList = function(usernames, callback) {
  Users.find(function(err, users) {
    var userInfos = [];
    users.forEach(function(user){
      if(usernames.indexOf(user.username) != -1) {
        userInfos.push({username: user.username, icon: user.icon});
      }
    });

    callback(userInfos);
  });
};

exports.getUserInfo = function(username, callback) {
  Users.find({username: username}, function(err, user) {
    if(user && user.length)
      callback({username: user[0].username, icon: user[0].icon});
  });
}

function usernameAvailable (username, callback) {
  Users.find({username: username}, callback);
}