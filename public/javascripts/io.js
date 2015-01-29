$.io = function(){
  var socket = io.connect('http://localhost:3000');

  socket.emit('init', {username: getCookie("username")});

  socket.on('message', function(data) {
    $.addMessage(data);
  });

  socket.on("addUser", function(user){
    $.addUser(user);
  });

  socket.on("removeUser", function(username){
    $.removeUser(username);
  });

  this.send = function(data) {
    socket.emit('send', data);
  };

  return this;
}
