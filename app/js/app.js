var ChatClient = require('./chat/client');
var bot = require('./bot');

var React = require('react'),
	Bot = require('./components/Bot.react');

React.render(
  <Bot />,
  document.getElementById('bot')
);
