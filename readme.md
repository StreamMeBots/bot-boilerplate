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
