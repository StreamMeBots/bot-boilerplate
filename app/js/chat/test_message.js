var assert = require('assert'),
	Message = require('./message'),
	m = new Message('SAY msg="does not matter"');

var tests = {};

tests.base = function() {
	var o = m.parseArgs('foo="bar"');
	assert.equal(o.foo, 'bar');
}

tests.multiple = function() {
	var o = m.parseArgs('foo="bar" quux="baz"');
	assert.equal(o.foo, 'bar');
	assert.equal(o.quux, 'baz');	
}

tests.keylessValues = function() {
	var o = m.parseArgs('=bar');
	for(var k in o) {
		assert.ok(false);
	}
}

tests.secondKey = function() {
	var o = m.parseArgs('foo="bar" foo="baz"');
	assert.equal(o.foo, 'bar');
}

tests.escapedQuotes = function() {
	var o = m.parseArgs('foo="bar\\"baz"');
	assert.equal(o.foo, 'bar"baz');
}

describe('Message', function() {
	describe('ParseArgs', function() {
		it('parses key value', tests.base);
		it('parses multiple key values', tests.multiple);
		it('ignores keyless values', tests.keylessValues);
		it('ignores second key', tests.secondKey)
		it('handles escaped quotes', tests.escapedQuotes)
	});
});
