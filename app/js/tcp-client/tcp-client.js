var fs = require('fs'),
	net = require('net'),
	tls = require('tls'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter,
	config = require('../config'),
	log = require('../log');

// @class Connection
var Connection = module.exports = function() {
	this.client = null;

	this.state = Connection.STATES.disconnected;
};
util.inherits(Connection, EventEmitter);

// States
Connection.STATES = {
	connected: 'connected',
	disconnected: 'disconnected',
};
Connection.CONNECT_MAX_ATTEMPTS = 3;
Connection.CONNECT_RETRY_INTERVAL = 2000;


// We are disconnected
Connection.prototype.disconnected = function() {
	this.state = Connection.STATES.disconnected;
	this.emit('disconnected');
	this.client = null;
}

Connection.prototype.isConnected = function() {
	return Connection.STATES.connected === this.state;
};

// disconnect
Connection.prototype.disconnect = function() {
	if(!this.client) {
		return;
	}
	this.client.end();
}

// Helper processBuffer
var processBuffer = function(s) {
	var cmds = [],
		last = 0;

	for(var i=0; i<s.length; i++) {
		if(s[i] !== '\n') {
			continue;
		}
		cmds.push(s.slice(last, i+1 ).trim());
		last = i;
	}
	s = s.slice( last );
	return [s.trim(), cmds];
}

// We are connected
Connection.prototype.connected = function() {
	var buffer = '';

	this.state = Connection.STATES.connected;
	this.emit('connected');

	this.client.on('data', function(data) {
		buffer += data.toString();
		var d = processBuffer(buffer);
		buffer = d[0];

		for(var i=0; i<d[1].length; i++) {
			log.debug('receiving', {msg: d[1][i]});
			this.emit('message', d[1][i]);
		}
	}.bind(this));

	this.client.on('end', this.disconnected.bind(this));
}

// Send the message
Connection.prototype.write = function(s) {
	if(s[s.length-1] !== '\n') {
		s += '\n';
	}
	log.debug('writing', {msg: s});
	this.client.write(s);
}

var connecting = false;
// Tries (and retries)
Connection.prototype.tryToConnect = function(i, cb) {
	if(typeof i === 'function') {
		cb = i;
		i = 0;
	}

	if(connecting || this.client) {
		return cb && cb();
	}

	if(!i) {
		i = 0;
	}

	if( this.state === Connection.STATES.connected ) {
		return cb && cb();
	}

	if(i >= Connection.CONNECT_MAX_ATTEMPTS) {
		return cb && cb( new Error('could not connect') );
	}

	connecting = true;
	log.debug('tcp-attempt-to-connect', {
		host: config.host,
		port: config.port
	});

	var getConnection;
	if(config.pemFile) {
		getConnection = function(done) {
			return tls.connect(config.port, config.host, {
				ca: [fs.readFileSync( config.pemFile ) ]
			}, done);
		}.bind(this);
	} else {
		getConnection = function(done) {
			return net.connect({
				host: config.host,
				port: config.port
			}, done);
		}.bind(this);
	}

	this.client = getConnection(function(err) {
		if(err) {
			log.error('tcp-error', {err: err});
			connecting = false;
			this.disconnected();
			setTimeout(function(){
				this.tryToConnect(i+1, cb)
			}.bind(this), Connection.CONNECT_RETRY_INTERVAL);
			return;
		}
		log.debug('tcp-connected');
		connecting = false;
		this.connected();
		cb && cb();

		cb = null;
	}.bind(this));
}
