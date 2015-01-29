
/*
 * GET home page.
 */
var db = require('./db');
var users = [];

exports.index = function(req, res){
  var message = getMessage(req);
  return res.render('index', { title: '登陆', message: message });
};

exports.chat = function(req, res) {
  return res.render('chat', {title: req.session.username});
};

exports.register = function(req, res) {
  var message = getMessage(req);
  return res.render('register', {title: '注册用户', message: message});
}

// 用户登陆
exports.login = function(req, res) {
  if(req.session.username != req.body.username && users.indexOf(req.body.username) != -1) {
    setMessage(req ,"此用户已经登录");
    return res.redirect("/");
  }

  var callback = function(req, res){
    return function(pass, username, icon){
      if(pass) {
        addUserInfoSession(req, username, icon);
        users.push(username);
        res.redirect("/chat");
      } else {
        setMessage(req ,"用户名或者密码错误");
        clearUserInfoSession(req);
        res.redirect("/");
      }
    }
  }

  db.login(req.body.username, req.body.password, callback(req, res));
};

// 注册用户
exports.registerUser = function(req, res) {
  var callback = function(req, res){
    return function(pass){
      if(pass) {
        res.redirect("/");
      } else {
        setMessage(req ,"用户名已存在");
        res.redirect("/register");
      }
    }
  }
  db.registerUser(req.body.username, req.body.password, req.body.icon, callback(req, res));
}

// 获取当前用户信息
exports.getUserInfo = function(req, res) {
  var session = req.session;
  res.send({username: session.username, icon: session.icon});
}

// 获取登陆人员的用户信息
exports.getUserList = function(req, res) {
  function callback(res) {
    return function(userInfos) {
      res.send(userInfos);
    }
  };

  db.getUserList(users,callback(res));
};

exports.sessionChecker = function(req, res, next){
  console.log("sdfsdfsdf");
  if(req.session == null || req.session.username == null) {
    return res.redirect("/");
  }

  next();
};

function setMessage(req, message) {
  var session = req.session;
  session.message = message;
}

function getMessage(req) {
  var message = "";
  if(req.session && req.session.message){
    message = req.session.message;
    req.session.message = null;
  }

  return message;
}

function addUserInfoSession(req, username, icon){
  req.session.username = username;
  req.session.icon = icon;
}

function clearUserInfoSession(req) {
  users.splice(users.indexOf(req.session.username), 1);
  req.session.username = null;
  req.session.icon = null;
}