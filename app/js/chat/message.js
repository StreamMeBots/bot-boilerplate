var tcpClient = require('../tcp-client');

// Message object
var Message = module.exports = function(message, internal) {
	this.internal = !!internal;

	var msgParts = this.parse(message, internal);
	this.action = msgParts[0] || null;
	this.args = msgParts[1] || null;
	this.serverMessage = msgParts[2] || '';
};
Message.SUPPORTED_COMMANDS = ["SAY", "JOIN", "LEAVE", "KICK", "PASS", "ERROR"];
Message.PARSE_STATES = {key: 'key', value: 'value'};

// Parse the arguments of a message
// k1="v1" k2="v2" k3="v\"3"
Message.prototype.parseArgs = function(s) {
	var state = Message.PARSE_STATES.key,
		tmpKey = '',
		tmpValue = '',
		qCount = 0,
		o = {};

	var unset = function() {
		tmpKey = '';
		tmpValue = '';
	}

	var set = function(tmpKey, tmpValue) {
		tmpKey = tmpKey.trim();
		if(o[tmpKey]) {
			return unset();
		}
		o[tmpKey] = tmpValue.replace(/\\/g, '');
		unset();
	}

	for(var i=0; i<s.length; i++) {
		switch(state) {
			// looking for keys
			case Message.PARSE_STATES.key:
				// found a =, now looking for values, reset the value
				if(s[i] === '=') {
					state = Message.PARSE_STATES.value;
					break;
				}
				// store the key name
				tmpKey += s[i];
				break;

			// looking for values
			case Message.PARSE_STATES.value:

				// found a " that wasn't preceded by a \, do something
				if(s[i] === '"' && i > 0 && s[i-1] !== '\\') {

					// its the second time, end the value, store it
					if(qCount === 1) {
						state = Message.PARSE_STATES.key;

						if(tmpKey) {
							set(tmpKey, tmpValue);
						}

						qCount = 0;
						break;
					}
					// its the first time, start the value
					qCount = 1;
					break;
				}

				// something funny is going on, something like foo=afeawfawef"bar" or ="bar"
				if(qCount !== 1 || !tmpKey) {
					break;
				}

				// keep track of the value
				tmpValue += s[i];
				break;
		}
	}

	return o;
};

// Parse a message
Message.prototype.parse = function(message, internal) {
	if(!message) {
		return [];
	}

	var tmp = message.split(/\ /);
	if(Message.SUPPORTED_COMMANDS.indexOf(tmp[0]) === -1) {
		tmp.unshift('SAY');
	}

	var args = tmp.slice(1),
		serverMessage = '',
		meta = {};

	if(internal) {
		serverMessage = tmp[0] + ' ' + args.join(' ');
		args = null;
	} else {
		args = this.parseArgs(args.join(' '));
	}

	return [tmp[0], args, serverMessage];
}

Message.prototype.isValid = function() {
	return !!this.action;
}

// Execute a message
Message.prototype.execute = function() {
	// TODO: validate actions and name arguments
	switch(this.action) {
		default:
			tcpClient && tcpClient.write(this.serverMessage);
	}
}

// Intepret the command, usually this means relay contents for 'message="contents"'
Message.prototype.interpret = function() {
	switch(this.action) {
		default:
			return this.args.message;
	}
}
