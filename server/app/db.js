var config = require('./config');
config.appFolder = __dirname;
var ChatApp = require('./lib/ChatApp');

var MessageActions = require('./lib/actions/MessageActions');

new ChatApp(config).connectMongo(function(db) {
  (new MessageActions(db)).userSend('58789957dc5d097d5b2a138c', '58789a4ddc5d097d5b2a138e', '58789a58771b0c66973962cc', 'one check', false, function() {})
});
