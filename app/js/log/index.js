var Log = require('./log');
var config = require('../config');
var l = new Log({
	level: config.logLevel
});

module.exports = l.log;

for(var k in l) {
	if(typeof l[k] === 'function') {
		module.exports[k] = l[k].bind(l);
	}
}
