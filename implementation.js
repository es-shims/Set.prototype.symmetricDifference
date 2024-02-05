'use strict';

// Note: the commented out code is because there is no performant way in userland to do the optimization in step 7.

var $TypeError = require('es-errors/type');

var $Set = require('es-set/polyfill')();

var GetIteratorFromMethod = require('es-abstract/2023/GetIteratorFromMethod');
var GetSetRecord = require('./aos/GetSetRecord');
var IteratorStep = require('es-abstract/2023/IteratorStep');
var IteratorValue = require('es-abstract/2023/IteratorValue');
// var SetDataHas = require('./aos/SetDataHas');

var isSet = require('is-set');

var tools = require('es-set/tools');
var $setAdd = tools.add;
var $setDelete = tools['delete'];
var $setForEach = tools.forEach;
var $setHas = tools.has;

module.exports = function symmetricDifference(other) {
	var O = this; // step 1

	// RequireInternalSlot(O, [[SetData]]); // step 2
	if (!isSet(O) && !(O instanceof $Set)) {
		throw new $TypeError('Method Set.prototype.symmetricDifference called on incompatible receiver ' + O);
	}

	var otherRec = GetSetRecord(other); // step 3

	var keysIter = GetIteratorFromMethod(otherRec['[[Set]]'], otherRec['[[Keys]]']); // step 4

	var result = new $Set();
	$setForEach(O, function (value) {
		$setAdd(result, value);
	});

	var next = true; // step 6
	while (next) { // step 7
		next = IteratorStep(keysIter); // step 7.a
		if (next) { // step 7.b
			var nextValue = IteratorValue(next); // step 7.b.i
			if (nextValue === 0) { // step 7.b.ii
				nextValue = +0;
			}
			// var inResult = SetDataHas(resultSetData, nextValue); // step 7.b.iii
			var inResult = $setHas(result, nextValue);
			// if (SetDataHas(O.[[SetData]], nextValue)) { // step 7.b.iv
			if ($setHas(O, nextValue)) { // step 7.b.iv
				if (inResult) {
					// remove nextValue from resultSetData. // step 7.b.iv.1
					$setDelete(result, nextValue);
				}
			} else if (!inResult) {
				// append nextValue to resultSetData // step 7.b.iv.2
				$setAdd(result, nextValue);
			}
		}
	}

	// var result = OrdinaryObjectCreate(%Set.prototype%, « [[SetData]] »); // step 8

	// result.[[SetData]] = resultSetData; // step 9

	return result; // step 10

};
