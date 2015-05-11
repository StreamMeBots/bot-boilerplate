var util = require('util'),
	EventEmitter = require('events').EventEmitter,
	request = require('request'),
	config = require('../config'),
	tcp = require('../tcp-client'),
	ChatMessage = require('./message');

var Client = function() {
	this.resetState();
	tcp.on('disconnected', this.resetState.bind(this));
	tcp.on('message', this.onMessage.bind(this));
}
util.inherits(Client, EventEmitter);

// Resets room state
Client.prototype.resetState = function() {
	this.room = null;
	this.authorized = false;
	this.authorizedWith = {};
}

// Join a room
Client.prototype.join = function(room, cb) {
	var chatMessage = new ChatMessage('JOIN ' + room, true);

	if(this.room) {
		return cb && cb();
	}

	this.wait('JOIN', function(err, success) {
		if(success) {
			this.room = room;
		}
		cb && cb();
	}.bind(this));
	chatMessage.execute();
}

// Attemp to join a users room
Client.prototype.joinUsersRoom = function(user, cb) {
	request({
		method: 'get',
		url: config.restProtocol + config.host + '/api-user/v1/' + user + '/channel',
		json: true
	}, function(err, response, body) {
		if(err) {
			return cb(err);
		}
		if(response.statusCode !== 200) {
			return cb(new Error('unexpected statusCode: '+response.statusCode));
		}
		if(!body.userPublicId) {
			return cb(new Error('unexpected response, no publicId'));
		}
		this.join('user:' + body.userPublicId + ':web', cb);
	}.bind(this));
}

// Authenticate the bot
Client.prototype.authenticate = function(key, secret, cb) {
	if( this.authorized &&
			this.authorizedWith.key === key && this.authorizedWith.secret === secret ) {
		return cb && cb();
	}
	var chatMessage = new ChatMessage('PASS ' + key + ' ' + secret, true);
	this.wait('PASS', function(err, success) {
		if(success) {
			this.authorized = true;
			this.authorizedWith = {
				key: key,
				secret: secret
			}
		}
		cb && cb();
	}.bind(this));
	chatMessage.execute();
}

// wait for a command to be executed
Client.prototype.wait = function(command, cb) {
	var handleError = function(errMessage) {
		cb && cb(errMessage.interpret());
		cleanup();
	};
	var handleSuccess = function() {
		cb && cb(null, true);
		cleanup();
	}

	var cleanup = function() {
		cb = null;
		this.removeListener('ERROR', handleError);
		this.removeListener(command, handleSuccess)
	}.bind(this);

	this.on('ERROR', handleError);
	this.on(command, handleSuccess);
}

// Say something to the room
Client.prototype.say = function(message, cb) {
	var chatMessage = new ChatMessage('SAY ' + message, true);
	chatMessage.execute();
}

// Parse incoming message and re-emit
Client.prototype.onMessage = function(message) {
	var chatMessage = new ChatMessage(message);
	this.emit(chatMessage.action, chatMessage);
}

module.exports = new Client();
