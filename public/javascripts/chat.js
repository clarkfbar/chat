$(function(){
    var io = $.io();

    // option: targetName, send, message, senderName
    var addMessageToMessageList = function (option) {
        var targetMessage = messages.findWhere({targetName: option.targetName});

        if(targetMessage) {
            var messageList = targetMessage.get("messages");
            messageList.add({send: option.send, senderName: option.senderName, message: option.message, time: (new Date()).valueOf()});
        } else {
            var message = new Messages();
            message.add({send: option.send, senderName: option.senderName, message: option.message, time: (new Date()).valueOf()});
            messages.add({targetName: option.targetName, messages: message});
        }

        rightColView.renderList();
    }

    // 用户信息model
    var User = Backbone.Model.extend({
        defaults: function(){
            return {
                username: "John Doe",
                icon: "sdfsdfsd.gif"
            }
        }
    });

    // 用户信息colletion
    var UserList = Backbone.Collection.extend({
        model: User
    });

    // 聊天内容model，精确到每一条
    var Message = Backbone.Model.extend({
        defaults: function(){
            return {
                send: true,
                senderName: "1234",
                message: "123412312312",
                time: 1421810059102
            }
        }
    });

    // 聊天内容的collection
    var Messages = Backbone.Collection.extend({
        model: Message
    });

    // 聊天内容的model, 精确到每个对象
    var MessageList = Backbone.Model.extend({
        defaults: function(){
            return {
                targetName: "123123",
                messages: new Messages()
            }
        }
    });

    // 聊天内容和对象的collection
    var MessageLists = Backbone.Collection.extend({
        model: MessageList
    });
    
    var users = new UserList();
    var messages = new MessageLists();

    // 每一条聊天内容
    var MessageView = Backbone.View.extend({
        tagName: "li",

        className: "message",

        template: _.template("<img class='icon' src='<%= icon%>' /><span class='text text-left'><%= message%></span>"),

        initialize: function(){
            _.bindAll(this, "render");
            this.model.bind("change", this.render);
            this.model.bind("destroy", this.remove);
        },

        render: function(){
            // 判断是收到的信息，还是发出的信息
            if(this.model.get("send")) {
                $(this.el).addClass("send");
                icon = getCookie("icon");
            } else {
                $(this.el).addClass("receive");
                // 通过name在users中找到对应的用户信息，获取icon
                var senderName = this.model.get("senderName"),
                icon = users.findWhere({"username": senderName}).get("icon");
            }

            $(this.el).html(this.template({message: this.model.get("message"), icon: icon}));

            return this;
        }
    });

    // 聊天窗口的view
    var MessageListView = Backbone.View.extend({
        el: ".message-list",

        initialize: function(){
            _.bindAll(this, "render", "changeModel");

            this.model.bind("change", "render");
        },

        render: function(){
            var targetName = this.model.get("targetName");
            var messages = this.model.get("messages");

            $(this.el).empty();
            var self = this;

            messages.each(function(message){
                var messageview = new MessageView({model: message});
                $(self.el).append(messageview.render().el);
            });

            $(this.el).scrollTop($(this.el)[0].scrollHeight);
        },

        changeModel: function(model){
            this.model = model;
            this.model.bind("change", "render");
            this.render();
        }
    });

    var UploadView = Backbone.View.extend({
        el: "#uploadImage",

        events: {
            "change #uploadButton" : "uploadImage",
            "click #mockUpload" : "chooseFile"
        },

        initialize: function(){
            _.bindAll(this, "render", "uploadImage", "chooseFile");
        },

        chooseFile: function(){
            $("#uploadButton").click();
        },

        uploadImage: function(){
            $(this.el).find("form").submit();
        },

        render: function(){
            $(this.el).append("")
        }
    });

    var EmotionView = Backbone.View.extend({
        el: "#emotionCollection",

        tabTemplate: _.template('<li role="presentation"><a href="#<%= id%>" aria-controls="<%= id%>" role="tab" data-toggle="tab"><%= id%></a></li>'),
       
        contentTemplate: _.template('<div id="<%= id%>" class="tab-pane" role="tabpanel"></div>'),

        imageTemplate: _.template('<img src="<%= fixed%>" data-source="<%= path%>" class="icon"/>'),

        popTemplate: _.template('<img src="<%= path%>" class="pop"/>'),

        events: {
            "mouseover .icon" : "preview",
            "mouseout .icon" : "hidePreivew"
        },

        initialize: function(){
            _.bindAll(this, "render", "preview", "hidePreivew");
        },

        render: function(){
            var self = this;
            $.ajax({
                url: "/getImages",
                type: "GET",
                data: {type: "normal"},
                dataType: "JSON",
                success: function(list){
                    var index = 0;
                    for(var key in list) {
                        var $tab = $(self.tabTemplate({id: key}));
                        $(self.el).find(".nav-tabs").append($tab);
                        var $content = $(self.contentTemplate({id: key}));
                        $(self.el).find(".tab-content").append($content);
                        list[key].forEach(function(path){
                            $content.append(self.imageTemplate(path));
                        });

                        if(index == 0) {
                            $content.addClass("active");
                            $tab.addClass("active");
                        }
                        index ++;
                    }
                }
            })
        },

        preview: function(e){
            var $target = $(e.target);
            $("#preview").html(this.popTemplate({path: $target.data("source")}));
            var offset = $target.offset();
            $("#preview").css({top: offset.top - 110, left: offset.left}).show();
        },

        hidePreivew: function(){
            $("#preview").hide();
        }
    });

    // 页脚输入域view
    var FooterView = Backbone.View.extend({
        el: ".right-col footer",

        imageTemplate: _.template("<img src='<%= path%>'/>"),

        events: {
            "focus #inputBox" : "hidePlaceholder",
            "blur #inputBox" : "showPlaceholder",
            "click .placeholder" : "clickBox",
            "click #sendButton" : "sendMessage",
            "click .tab-pane img" : "addImage",
            "click #emotion" : "showEmotions"
        },

        initialize: function(){
            _.bindAll(this, "hidePlaceholder", "showPlaceholder", "clickBox", "sendMessage", "insertImage", "addImage", "showEmotions");

            this.emotionView = null;
            new UploadView();
        },

        showEmotions: function(e){
            if($(e.target).hasClass("active")) {
                $(e.target).removeClass("active");
                    $(this.emotionView.el).hide();
            } else {
                if(!this.emotionView) {
                    this.emotionView = new EmotionView();
                    this.emotionView.render();
                } else {
                    $(this.emotionView.el).show();
                }
                $(e.target).addClass("active")
            }
        },

        hidePlaceholder: function(){
            $(".right-col .placeholder").addClass("hidden");
        },

        showPlaceholder: function(){
            if($("#inputBox").html() == "") {
              $(".right-col .placeholder").removeClass("hidden");
            }
        },

        clickBox: function(){
            $("#inputBox").focus();
        },

        sendMessage: function(){
            var targetName = rightColView.getCurrentTargetName();
            var message = $("#inputBox").html();

            addMessageToMessageList({send: true, targetName: targetName, message: message, senderName: getCookie("username")});
            $("#inputBox").html("").blur();

            io.send({from: getCookie("username"), to: targetName, message: message});
        },

        addImage: function(e) {
            var $target = $(e.target);
            if(!$target.is("img")) {
                $target = $target.find("img"); 
            }

            var path = $target.data("source");
            this.insertImage(path);
        },

        insertImage: function(path){
            $("#inputBox").append(this.imageTemplate({path: path})).focus();
        }
    });

    // 右边窗口的view
    var RightColView = Backbone.View.extend({
        el: ".right-col",

        initialize: function(){
            _.bindAll(this, "render", "changeModel", "getCurrentTargetName", "renderList", "insertImage");
            this.messageListView = null;
            this.footerView = new FooterView();
        },

        render: function(){
            // 粘贴对方的username
            $(".right-col header .username").html(users.findWhere({username : this.model.get("targetName")}).get("username"));
            if(this.messageListView) {
                this.messageListView.changeModel(this.model);
            } else {
                this.messageListView = new MessageListView({model: this.model});
                this.messageListView.render();
            }
        },

        changeModel: function(model){
            this.model = model;
            this.render();
        },

        getCurrentTargetName: function(){
            return this.model.get("targetName");
        },

        renderList: function(){
            if(this.messageListView != null)
                this.messageListView.render();
        },

        insertImage: function(path){
            this.footerView.insertImage(path);
        }
    });

    // 单个用户view
    var UserView = Backbone.View.extend({
        tagName: "li",

        className: "user text-left",

        template: _.template("<img class='icon' src='<%= icon%>' /><span class='username'><%= username%></span>"),

        popTemplate: _.template("<div class='popMessage'><%= message%></div>"),

        initialize: function(){
            _.bindAll(this, "render", "addMessage", "removeUser");
            this.model.bind("change", this.render);
            this.model.bind("destroy", this.removeUser);
            messages.findWhere({targetName: this.model.get("username")}).bind("change", this.addMessage);
        },

        removeUser: function(){
            $(this.el).remove();
        },

        addMessage: function(message){
            if(!message.get("send") && !$(this.el).hasClass("current")) {
                $(this.el).append(this.popTemplate({message: message.get("message")}));
            }
        },

        render: function(){
            $(this.el).html(this.template({username: this.model.get("username"), icon: this.model.get("icon")}));
            $(this.el).data("username", this.model.get("username"));
            return this;
        }
    });

    // 用户列表的View
    var UserListView = Backbone.View.extend({
        el: ".user-list",

        popTemplate: _.template("<div class='popMessage'><%= message%></div>"),

        events: {
            "click .user" : "switchView"
        },

        initialize: function(){
            _.bindAll(this, "render", "switchView", "adduser", "renderMessage");
            users.bind("add", this.adduser);
            users.bind("remove", this.removeUser);
        },

        render: function(){
            $(this.el).empty();
            var self = this;
            users.each(function(user){
                self.adduser(user);
            });
        },

        adduser: function(user) {
            var userview = new UserView({model: user});
            $(this.el).append(userview.render().el);
        },

        removeUser: function(user) {
            user.destroy();
        },

        // 更换聊天窗口
        switchView: function(e){
            // 如果点击的是当前的，不改变
            if($(e.target).hasClass("current") || $(e.target).parents(".current").size() != 0){
                return;
            }

            $(this.el).find(".current").removeClass("current");
            if($(e.target).hasClass(".user")) {
              var username = $(e.target).data("username");
              $(e.target).addClass("current");
            } else {
              var username = $(e.target).closest(".user").data("username");
              $(e.target).closest(".user").addClass("current");
            }
            rightColView.changeModel(messages.findWhere({"targetName" : username}));
        },

        renderMessage: function(target, message){
            var self = this;
            $(this.el).find(".user").each(function(){
                if($(this).data("username") == target) {
                    if(!$(this).hasClass("current")){
                        $(this).append(self.popTemplate({message: message}));
                        var $this = $(this);
                        setTimeout(function(){
                            $this.find(".popMessage").fadeOut("normal", function(){
                                $(this).remove();
                            });
                        }, 3000);
                    }
                    return false;
                }
            });
        }
    });

    var AppView = Backbone.View.extend({
        el: $("body"),
        
        initialize: function(){
            getUserInfo();
            userList = new UserListView();
            this.getUserList();

            rightColView = new RightColView();

            this.render();
            userList.render();
        },

        render: function(){
            var username = getCookie("username");
            var icon = getCookie("icon");

            $(".left-col header .icon").attr("src", icon);
            $(".left-col header .username").html(username);
        },

        getUserList: function(){
            $.ajax({
                url: "/getUserList",
                type: "GET",
                async: false,
                dataType: "JSON",
                cache: false,
                success: function(data){
                    $.each(data, function(index, user) {
                        if(user.username != getCookie("username")) {
                            initUser(user);
                        }
                    });
                }
            });
        }
    });
    
    var app = new AppView();
    var rightColView;
    var userList;

    $.addMessage = function(message){
        messages.findWhere({targetName: message.from}).get("messages").add({send: false, senderName: message.from, message: message.message, time: (new Date()).valueOf()});
        rightColView.renderList();
        userList.renderMessage(message.from, message.message);
    };

    $.addUser = function(user) {
        initUser(user);
    };

    $.removeUser = function(username) {
        removeUserConfig(username);
    };

    function removeUserConfig(username){
        users.remove(users.findWhere({username: username}));
        messages.remove(users.findWhere({targetName: username}));
    };

    function initUser (user){
        if(users.where({username: user.username}).length == 0) {
            messages.add({targetName: user.username, messages: new Messages()}); // 初始化
            users.add({username: user.username, icon: user.icon});
        }
    }

    $.insertImage = function(path) {
        rightColView.insertImage(path);
    }
});