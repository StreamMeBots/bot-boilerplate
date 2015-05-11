var util = require('util'),
	EventEmitter = require('events').EventEmitter,
	chatClient = require('../chat/client'),
	tcpClient = require('../tcp-client/index');

// @class Bot
var Bot = module.exports = function(){
	this.attributes = {};
	this.attributes.key = localStorage.getItem('botKey');
	this.attributes.secret = localStorage.getItem('botSecret');
	this.attributes.room = localStorage.getItem('botRoom');
	this.attributes.authorized = false;
	this.attributes.joined = false;

	chatClient.on('SAY', this.parseSay.bind(this));
	chatClient.on('ERROR', this.handleErrors.bind(this));
}
util.inherits(Bot, EventEmitter);

// getters / setters
Bot.prototype = {
	get key() {
		return this.attributes.key;
	},
	get secret() {
		return this.attributes.secret;
	},
	get room() {
		return this.attributes.room;
	},
	get joined() {
		return this.attributes.joined;
	},
	get authorized() {
		return this.attributes.authorized;
	},
	set key(k) {
		this.attributes.key = k;
		localStorage.setItem('botKey', k);
	},
	set secret(k) {
		this.attributes.secret = k;
		localStorage.setItem('botSecret', k);
	},
	set room(k) {
		this.attributes.room = k;
		localStorage.setItem('botRoom', k);
	}
}

// attempt to connect
Bot.prototype.connect = function(cb) {
	// must supply a key and a secret
	if(!this.attributes.key || !this.attributes.secret) {
		return cb && cb(null, false);
	}

	// make sure the tcp connection has been established
	tcpClient.tryToConnect(function(err) {
		if(err) {
			return cb && cb(err);
		}

		// authenticate the chat client
		chatClient.authenticate(this.attributes.key, this.attributes.secret, function(err) {
			if(err) {
				this.attributes.authorized = false;
				// Already logged
				return cb && cb(null, false);
			}

			this.attributes.authorized = true;
			// try join the room with the bot
			chatClient.joinUsersRoom(this.attributes.room, function(err){
				if(err) {
					this.attributes.joined = false;
					// Already logged
					return cb && cb(null, false);
				}
				this.attributes.joined = true;
				cb && cb(null, true);
			}.bind(this));
		}.bind(this));
	}.bind(this));
}

// attempt to disconnect
Bot.prototype.disconnect = function(cb) {
	tcpClient.disconnect();
	this.attributes.joined = false;
	this.attributes.authorized = false;
	cb && cb();
};

// handle errors
Bot.prototype.handleErrors = function(err) {
	// TODO: ui element
	// handle "invalid authentication" to toggle disconnect / connect / state
	// log everything
	console.log(err.interpret());
}

// Parse incoming messages
Bot.prototype.parseSay = function(command) {
	
}
