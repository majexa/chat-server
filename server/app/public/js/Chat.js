// Generated by CoffeeScript 1.11.1
(function() {
  var Chat;

  Chat = (function() {
    Chat.prototype.messages = [];

    function Chat(userInfo, toUserId) {
      this.userInfo = userInfo;
      this.toUserId = toUserId;
      MicroEvent.mixin(this);
    }

    Chat.prototype.restart = function() {
      this.socket.disconnect();
      return this.socket.connect();
    };

    Chat.prototype.startSocket = function(token, chatId) {
      var socket;
      this.token = token;
      this.chatId = chatId;
      this.socket = socket = io.connect();
      socket.on('connect', (function() {
        return socket.emit('authenticate', {
          token: token
        });
      }).bind(this));
      return socket.on('authenticated', (function() {
        this.chatId = chatId;
        return socket.emit('join', {
          chatId: chatId
        });
      }).bind(this)).on('event', (function(data) {
        return this.trigger(data.type, data);
      }).bind(this)).on('unauthorized', function(msg) {
        return console.log('unauthorized: ' + JSON.stringify(msg.data));
      });
    };

    Chat.prototype.start = function() {
      return new Request.JSON({
        url: '/api/v1/login',
        onComplete: (function(data) {
          return new Request.JSON({
            url: '/api/v1/chat/getOrCreateByTwoUser',
            onComplete: (function(chat) {
              this.startSocket(data.token, chat.chatId);
            }).bind(this)
          }).get({
            fromUserId: data._id,
            toUserId: this.toUserId
          });
        }).bind(this)
      }).get(this.userInfo);
    };

    Chat.prototype.sendMessage = function(message) {
      return new Request({
        url: '/api/v1/message/send'
      }).get({
        token: this.token,
        chatId: this.chatId,
        message: message
      });
    };

    return Chat;

  })();

  window.Chat = Chat;

}).call(this);

//# sourceMappingURL=Chat.js.map