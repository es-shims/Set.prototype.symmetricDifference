'use strict';

var getPolyfill = require('./polyfill');
var define = require('define-properties');
var shimSet = require('es-set/shim');

module.exports = function shimSetSymmetricDifference() {
	shimSet();

	var polyfill = getPolyfill();
	define(
		Set.prototype,
		{ symmetricDifference: polyfill },
		{ symmetricDifference: function () { return Set.prototype.symmetricDifference !== polyfill; } }
	);

	return polyfill;
};
