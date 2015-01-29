(function(){
  var $registerForm = $("#registerForm");

  $registerForm.submit(function(e){
    if($("#username").val() == "") {
      alert("请填写用户名");
      e.preventDefault();
      return false;
    }

    if($("#password").val() == "") {
      alert("密码不能为空");
      e.preventDefault();
      return false;
    }

    if($("#repassword").val() == "") {
      alert("确认密码不能为空");
      e.preventDefault();
      return false;
    }

    if($("#repassword").val() != $("#password").val()) {
      alert("密码与确认密码不相同");
      e.preventDefault();
      return false;
    }

    if($("#icon").val() == "") {
      alert("头像路径不能为空，否则把你变成大猪头");
      e.preventDefault();
      return false;
    }
  });

  $(".icon .input-group-addon").click(function(){
    $("#uploadButton").click();
  });

  $("#uploadButton").change(function(){
    $("#imageForm").submit();
  });
})(jQuery);

function insertIcon(path){
  $("#icon").val(path);
  $("#iconMock").val(path);
}