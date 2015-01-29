
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var app = express();
var io = require('./routes/io');
var upload = require('./routes/upload');
var emotions = require('./routes/emotions');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: 'secret'}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/chat', routes.sessionChecker, routes.chat);
app.get('/register', routes.register);
app.get('/getUserInfo', routes.sessionChecker, routes.getUserInfo);
app.post('/login', routes.login);
app.post('/registerUser', routes.registerUser);
app.get('/getUserList', routes.sessionChecker, routes.getUserList);
app.post('/upload', routes.sessionChecker, upload.upload);
app.post('/uploadIcon', upload.uploadIcon);
app.get('/getImages', emotions.getImages);

var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.initSocket(server);
