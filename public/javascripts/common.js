
// 添加Cookie
function addCookie(name, value, options) {
  if (arguments.length > 1 && name != null) {
    options = $.extend({path: '/'}, options||{})
    if (value == null) {
      options.expires = -1;
    }
    if (typeof options.expires == "number") {
      var time = options.expires;
      var expires = options.expires = new Date();
      expires.setTime(expires.getTime() + time * 1000);
    }
    document.cookie = encodeURIComponent(String(name)) + "=" + encodeURIComponent(String(value)) + (options.expires ? "; expires=" + options.expires.toUTCString() : "") + (options.path ? "; path=" + options.path : "") + (options.domain ? "; domain=" + options.domain : ""), (options.secure ? "; secure" : "");
  }
}

// 获取Cookie
function getCookie(name) {
  if (name != null) {
    var value = new RegExp("(?:^|; )" + encodeURIComponent(String(name)) + "=([^;]*)").exec(document.cookie);
    return value ? decodeURIComponent(value[1]) : null;
  }
}

// 移除Cookie
function removeCookie(name, options) {
  addCookie(name, null, options);
}

if($("body").data("message") != undefined && $("body").data("message") != "") {
  alert($("body").data("message"));
}

function getUserInfo(){
  $.ajax({
    url: '/getUserInfo',
    type: "GET",
    dataType: "JSON",
    async: false,
    success: function(info){
      addCookie("username", info.username);
      addCookie("icon", info.icon);
    }
  })
}

function insertImage(path){
  $.insertImage(path);
}