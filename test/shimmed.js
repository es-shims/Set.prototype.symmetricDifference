'use strict';

var orig = typeof Set === 'function' && Set.prototype.symmetricDifference;

require('../auto');

var shimmed = orig !== Set.prototype.symmetricDifference;

var test = require('tape');

var runTests = require('./builtin');

test('shimmed', function (t) {
	t.comment('shimmed: ' + (shimmed ? 'YES' : 'NO'));
	runTests(t);

	t.end();
});
