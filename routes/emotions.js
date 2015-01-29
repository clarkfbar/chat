var fs = require("fs");

var emotions = {};
var initialized = false;
var path = "./public/images/emotion";

function explorer(path, filename) {
  initialized = true;
  fs.readdir(path, function(err, files){
    if(err) {
      console.log(err);
      return;
    }

    files.forEach(function(file){
      fs.stat(path + "/" + file, function(err, stat){
        if(err) {
          console.log(err);
          return;
        }

        if(stat.isDirectory()) {
          // 文件夹
          explorer(path + '/' + file, file);
        } else {
          if(!emotions[filename]) {
            emotions[filename] = [];
          }
          if(file.indexOf("fixed") == -1) {
            var filePath = path.split("/public").join("");
            emotions[filename].push({path: filePath + '/' + file, fixed: filePath + '/' + file + 'fixed'});
          }
        }
      });
    });
  });
}

explorer(path, "");

exports.getImages = function(req, res){
  if(!initialized) {
    explorer(path, "");
  }

  res.send(emotions);
}