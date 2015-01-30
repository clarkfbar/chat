var formidable = require("formidable");
var fs = require("fs");
var sys = require("sys");

exports.upload = function(req, res){
  var form = new formidable.IncomingForm(); 
  form.uploadDir = "./public/images/upload";
  form.keepExtensions = true;
  form.encoding = 'utf-8';
  form.parse(req, function(error,fields,files){
    if(error) {
      console.log(error);
      return;
    }

    var path = files.image.path.split("\\");
    path[0] = ""; //把前面的public去掉，要不然无法map到正确路径
    path = path.join("/");

    res.writeHead(200, {'content-type':'text/html'});
    res.end("<script>parent.insertImage('" + path + "')</script>;");
  });
  return;  
}

exports.uploadIcon = function(req, res){
  var form = new formidable.IncomingForm(); 
  form.uploadDir = "./public/images/icon";
  form.keepExtensions = true;
  form.encoding = 'utf-8';
  form.parse(req, function(error,fields,files){
    if(error) {
      console.log(error);
      return;
    }

    var path = files.image.path.split("\\");
    path[0] = ""; //把前面的public去掉，要不然无法map到正确路径
    path = path.join("/");

    res.writeHead(200, {'content-type':'text/html'});
    res.end("<script>parent.insertIcon('" + path + "')</script>;");
  });
  return;  
}