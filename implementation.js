'use strict';

// Note: the commented out code is because there is no performant way in userland to do the optimization in step 7.

var $TypeError = require('es-errors/type');

var $Set = require('es-set/polyfill')();

var GetIteratorFromMethod = require('es-abstract/2024/GetIteratorFromMethod');
var GetSetRecord = require('./aos/GetSetRecord');
var IteratorStepValue = require('es-abstract/2024/IteratorStepValue');
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

	var next; // step 6
	while (!keysIter['[[Done]]']) { // step 7
		next = IteratorStepValue(keysIter); // step 7.a
		if (!keysIter['[[Done]]']) { // step 7.b
			if (next === 0) { // step 7.b.i
				next = +0;
			}
			// Let resultIndex be SetDataIndex(resultSetData, next). // step 7.b.ii
			var inResult = $setHas(result, next);

			// if (SetDataHas(O.[[SetData]], next)) { // step 7.b.iii
			if ($setHas(O, next)) { // step 7.b.iii
				if (inResult) {
					// remove next from resultSetData. // step 7.b.iii.1
					$setDelete(result, next);
				}
			} else if (!inResult) {
				// append nextValue to resultSetData // step 7.b.iii.2
				$setAdd(result, next);
			}
		}
	}

	// var result = OrdinaryObjectCreate(%Set.prototype%, « [[SetData]] »); // step 8

	// result.[[SetData]] = resultSetData; // step 9

	return result; // step 10

};
