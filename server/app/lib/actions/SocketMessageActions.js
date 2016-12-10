// Generated by CoffeeScript 1.11.1
(function() {
  var MessageActions, SocketMessageActions;

  MessageActions = require('./MessageActions');

  SocketMessageActions = (function() {
    function SocketMessageActions(server) {
      this.server = server;
      if (this.called) {
        throw new Error('FUCK');
      }
      this.called = true;
      this.server.event.on('newMessage', this.newMessageEvent.bind(this));
      this.server.event.on('newUserMessage', this.newUserMessageEvent.bind(this));
    }

    SocketMessageActions.prototype.newUserMessageEvent = function(message) {
      var clients, results, socketId;
      console.log(message);
      clients = this.server.io.sockets.clients();
      results = [];
      for (socketId in clients.connected) {
        if (message.toUserId + '' === clients.connected[socketId].userId) {
          results.push(clients.connected[socketId].emit('event', {
            type: 'newUserMessage',
            message: message
          }));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    SocketMessageActions.prototype.newMessageEvent = function(message) {
      var clients, onlineUserSockets, socket, socketId;
      clients = this.server.io.sockets.adapter.rooms[message.chatId];
      if (!clients) {
        return;
      }
      if (clients.sockets.length === 0) {
        return;
      }
      onlineUserSockets = {};
      for (socketId in clients.sockets) {
        socket = this.server.io.sockets.connected[socketId];
        onlineUserSockets[socket.userId] = socket;
      }
      return new MessageActions(this.server.db).getUserMessages(message, (function(userMessages) {
        var onlineMessageStatusIds, onlineUserId, results, userMessage;
        onlineMessageStatusIds = [];
        for (userMessage in userMessages) {
          if (onlineUserSockets[userMessage.ownUserId]) {
            onlineMessageStatusIds.push(userMessage._id);
          }
        }
        results = [];
        for (onlineUserId in onlineUserSockets) {
          results.push(onlineUserSockets[onlineUserId].emit('event', {
            type: 'newMessage',
            message: userMessages[onlineUserId]
          }));
        }
        return results;
      }).bind(this));
    };

    return SocketMessageActions;

  })();

  module.exports = SocketMessageActions;

}).call(this);

//# sourceMappingURL=SocketMessageActions.js.map
