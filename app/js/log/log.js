var _ = require('lodash'),
	ansi = require('ansi'),
	moment = require('moment');

var defaultOptions = {
	accessLog: false,
	stderrStreams: [process.stderr],
	stdoutStreams: [process.stdout],
	defaultLevel: 'info',
	levels: ['debug', 'verbose', 'info', 'warn', 'error', 'fatal'],
	stderrBreak: 'info',
	level: 'info'
};

/**
 * @class Log
 * @param {Object} [options]
 * @param {Object} [options.stderrStreams]
 * @param {Object} [options.stdoutStreams]
 */
var Log = module.exports = function(options){
	this.options = _.extend({}, defaultOptions, options);
	this.setStreams(this.options.stdoutStreams, this.options.stderrStreams);
	this.setLevels();
	this.paused = false;
};

/** Sets stdout and stderr streams
 * @method setStreams
 * @param {Object} [stdout] stdout stream
 * @param {Object} [stderr] stderr stream
 */
Log.prototype.setStreams = function(stdout, stderr, d) {
	this.stderrCursors = _.map(stderr, function(s){ return ansi(s); });
	this.stdoutCursors = _.map(stdout, function(s){ return ansi(s); });
}

/**
 * @method setLevel
 * @param {String} [l]
 */
Log.prototype.setLevel = function(l) {
	this.options.level = l;
	this.setLevels();
}

/**
 * @method setOption
 * @param {String} [key]
 * @param {Any} [value]
 */
Log.prototype.setOption = function(k, v) {
	this.options[k] = v;
}

/**
 * @method getOption
 * @param {String} [key]
 * @param {Any} [value]
 */
Log.prototype.getOption = function(k) {
	return this.options[k];
}

/**
 * @method setLevels
 * @param 
 */
Log.prototype.setLevels = function() {
	var writing = false,
		stderring = false,
		stderrMap = {},
		stdoutMap = {},
		streams, l;

	for(var i=0; i<this.options.levels.length; i++) {
		l = this.options.levels[i];

		if(!stderring && l === this.options.stderrBreak) stderring = true;
		if(!writing && l === this.options.level) writing = true;

		this[l] = this.generateWrite(l);
		if(!writing) continue;

		if(stderring)
			stderrMap[l] = true;
		else
			stdoutMap[l] = true;
	}

	this.stderrMap = stderrMap;
	this.stdoutMap = stdoutMap;
}

/**
 * @method generateWrite
 * @param {Function} [level]
 */
Log.prototype.generateWrite = function(level) {
	return function() {
		var a = _.map(arguments, function(x){ return x; });
		a.unshift(level);
		this.write.apply(this, a);
	}.bind(this);
}

/**
 * @method parseMsg
 * @param {Any} [addition]
 */
Log.prototype.parseMsg = function(addition, n) {
	var s = this,
		n = n || 0;

	if (addition instanceof Error) {
		addition = addition.message;
	}

	if(Array.isArray(addition)){
		return addition.join(',');
	}

	if(typeof addition === 'object')
		return _.map(addition, function(v, k){ 
			var m = s.parseMsg(v, n+1);
			if(n > 0)
				return k+':['+m+']'; 
			return k+'='+m;
		});

	return String(addition);
}

/**
 * @method writeTo
 * @param {String} [type]
 * @param {String} [header]
 * @param {String} [writeOptions]
 * @param {String} [msg]
 */
Log.prototype.writeTo = function(type, header, writeOptions, msg) {
	var s = this[type+'Cursors'] || [];

	for(var i=0; i<s.length; i++) {
		s[i].write(header)
		s[i].write(msg+'\n');
		s[i].fg.reset();
	}
}

Log.prototype.formatHeader = function(l) {
	return '';
	var ts = moment().format('HH:mm:ss');
	return ts + ' l='+l.slice(0, 1).toUpperCase() + ' pid=' + process.pid + ' ';
}

/**
 * @method write
 */
Log.prototype.log = Log.prototype.write = function() {
	if(this.paused) return;

	var a = _.map(arguments, function(x){ return x; }),
		msg = '', writeOptions = {}, header, l, i, c;

	if(this.options.levels.indexOf(a[0]) === -1 && a[0] !== 'd'){
		l = this.options.defaultLevel;
	} else {
		l = a[0];
		a.splice(0, 1);
	}

	if(!a.length) return;

	for(i=0; i<a.length; i++) {
		if(i > 0) msg += ', ';
		msg += this.parseMsg(a[i]);
	}

	header = this.formatHeader(l);
	if(this.stderrMap[l]) this.writeTo('stderr', header, writeOptions, msg);
	if(this.stdoutMap[l]) this.writeTo('stdout', header, writeOptions, msg);
}

/**
 * @method trace
 */
Log.prototype.trace = function() {
	var a = _.map(arguments, function(x){ return x; });
	var e = a.splice(0, 1)[0];
	a.unshift(e.message, e.stack);
	this.error.apply(this, a);
}

/**
 * @method pause
 */
Log.prototype.pause = function() {
	this.paused = true;
}

/**
 * @method resume
 */
Log.prototype.resume = function() {
	this.paused = false;
}
