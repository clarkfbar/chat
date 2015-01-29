var db = require('./db');

exports.initSocket = function(server){
  var io = require('socket.io').listen(server);

  io.sockets.on('connection', function(socket){
    socket.on('init', function(data){
      socket.username = data.username;

      function callback(clients) {
        return function(userInfo){
          for(var id in clients) {
            if(clients[id].username != data.username) {
              clients[id].emit("addUser", userInfo);
            }
          }
        };
      };

      db.getUserInfo(data.username, callback(io.sockets.connected));
    });

    socket.on('send', function(data) {
      var clients = io.sockets.connected;

      for(var id in clients) {
        if(clients[id].username == data.to) {
          clients[id].emit('message', data);
        }
      }
    });

    socket.on('disconnect', function(){
      if(!socket.username) return;
      var clients = io.sockets.connected;
      for(var id in clients) {
        if(clients[id].username != socket.username) {
          clients[id].emit("removeUser", socket.username);
        }
      }
    });
  });
}