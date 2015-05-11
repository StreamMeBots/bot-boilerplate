# StreamMe NW Bot Boilerplate

StreamMe NW Bot Boilerplate provides a groundwork for a creating node webkit + react bot application.  It contains:

	* A tcp connection abstraction
	* A message parser for StreamMe chat messages
	* A chat client to receive and emit StreamMe chat messages
	* A basic bot abstraction to establish a connection, join a bot to a room
	* An interface to set the key and secret
	* A mechanism to build

## Dependencies

Install io.js from https://iojs.org/en/index.html
Install node webkit from http://nwjs.io/

	sudo npm install -g nw

Install sass

		npm install -g node-sass

Install browserify

		npm install -g browserify

### Mac / Linux

To build for windows, install wine from https://www.winehq.org

## Building

To test and debug, from the app directory:

	$ npm install
	$ npm run-script run

To build, from the root directory:

	$ npm install
	$ npm run-script build

Change the build script (build.js) to modify the icons, application name, or platforms.

## Getting Started with Development

* Acquire a bot key and secret from https://www.stream.me/developers/bots
* Launch the application and make sure you can connect to your room using the key and secret
* In "app/js/bot/bot.js" use the "parseSay method" to write an echo function

		// Parse incoming messages
		Bot.prototype.parseSay = function(command) {
			chatClient.say(command.args.message);
		}
* Run the app with "npm run-script run", enter your key, secret, and room.  Once connected, echo bot should echo everything your users say

## Listening to other events

The top of "app/js/bot/bot.js" listens for "says" and "errors", here are some other events that can come through:

		SAY publicId="8b5b64d3-57a4-4702-87d3-99dff9aad1eb" username="test" role="owner" messageId="7612e141-c2bb-4300-b075-efaab41ef77b" timestamp="2015-05-06T21:04:23+00:00" message="Message One"
		JOIN publicId="8b5b64d3-57a4-4702-87d3-99dff9aad1eb" roomId="user:dc91e23e-68b4-42c0-a2e9-528a0b05b50c:web" username="test" role="owner" timestamp="2015-05-06T21:04:13+00:00"
		ERASE messageIds="7612e141-c2bb-4300-b075-efaab41ef77b,fb570949-77b5-4ec8-a497-6997bc7cf423" publicId="8b5b64d3-57a4-4702-87d3-99dff9aad1eb" username="test" role="owner" timestamp="2015-05-06T21:04:53+00:00"
		LEAVE publicId="8b5b64d3-57a4-4702-87d3-99dff9aad1eb" roomId="user:dc91e23e-68b4-42c0-a2e9-528a0b05b50c:web" username="test" role="owner" timestamp="2015-05-06T21:05:04+00:00"
