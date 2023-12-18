'use strict';

var $Set = require('es-set/polyfill')();
var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var $Map = require('es-map/polyfill')();
var getIterator = require('es-get-iterator');

var setEqual = function compareSetLikes(t, actual, expected, msg) {
	t.test('setlikes: ' + msg, function (st) {
		st.ok(actual instanceof expected.constructor, 'actual is an instance of the expected constructor');
		st.ok(expected instanceof actual.constructor, 'expected is an instance of the actual constructor');
		st.equal(actual.size, expected.size, 'they have the same size');

		if (actual.forEach) {
			actual.forEach(function (x) {
				st.ok(expected.has(x), debug(x) + ' (in actual) is in the expected set');
			});
		}

		if (expected.forEach) {
			expected.forEach(function (x) {
				st.ok(actual.has(x), debug(x) + ' (in expected) is in the actual set');
			});
		}

		st.end();
	});
};

module.exports = function (symmetricDifference, t) {
	t.test('throws on non-set receivers', function (st) {
		forEach(v.primitives.concat(v.objects, [], new $Map()), function (nonSet) {
			st['throws'](
				function () { symmetricDifference(nonSet, {}); },
				TypeError,
				debug(nonSet) + ' is not a Set'
			);
		});

		st.end();
	});

	t.test('non-Setlike `other`', function (st) {
		var set = new $Set([1, 2]);

		forEach(v.primitives, function (primitive) {
			st['throws'](
				function () { symmetricDifference(set, primitive); },
				TypeError,
				debug(primitive) + ' is not a Set-like'
			);
		});

		st.test('unable to get a Set Record', function (s2t) {
			forEach(v.objects, function (nonSetlike) {
				s2t['throws'](
					function () { symmetricDifference(set, nonSetlike); },
					TypeError,
					debug(nonSetlike) + ' is an Object, but is not Set-like'
				);
			});

			var nanSizedSetlike = {
				has: function () {},
				keys: function () {},
				size: NaN
			};
			s2t['throws'](
				function () { symmetricDifference(set, nanSizedSetlike); },
				TypeError,
				debug(nanSizedSetlike) + ' has a NaN `.size`'
			);

			forEach(v.nonFunctions, function (nonFunction) {
				var badHas = {
					has: nonFunction,
					keys: function () {},
					size: 0
				};
				var badKeys = {
					has: function () {},
					keys: nonFunction,
					size: 0
				};

				s2t['throws'](
					function () { symmetricDifference(set, badHas); },
					TypeError,
					debug(badHas) + ' has a non-callable `.has`'
				);
				s2t['throws'](
					function () { symmetricDifference(set, badKeys); },
					TypeError,
					debug(badKeys) + ' has a non-callable `.keys`'
				);
			});

			s2t.end();
		});

		st.test('misbehaving `.keys`', function (s2t) {
			var setlikeThrows = {
				has: function () {},
				keys: function () { throw new SyntaxError('keys error'); },
				size: 0
			};

			s2t['throws'](
				function () { symmetricDifference(set, setlikeThrows); },
				SyntaxError,
				debug(setlikeThrows) + ' throws when `.keys` is called, on purpose'
			);

			forEach(v.primitives, function (primitive) {
				var primitiveIter = {
					has: function () {},
					keys: function () { return primitive; },
					size: 0
				};
				s2t['throws'](
					function () { symmetricDifference(set, primitiveIter); },
					TypeError,
					'setlike `.keys` returning ' + debug(primitive) + ' throws'
				);
			});

			forEach(v.nonFunctions, function (nonFunction) {
				var badIter = {
					has: function () {},
					keys: function () { return { next: nonFunction }; },
					size: 0
				};
				s2t['throws'](
					function () { symmetricDifference(set, badIter); },
					TypeError,
					debug(badIter) + ' has a non-callable `.next`'
				);
			});

			s2t.end();
		});

		st.end();
	});

	t.test('symmetricDifferences', function (st) {
		var set1 = new $Set([1, 2, 3, 4, 5, 6]);
		var set2 = new $Set([4, 5, 6]);
		var result = symmetricDifference(set1, set2);

		st.ok(result instanceof $Set, 'returns a Set');
		setEqual(
			st,
			result,
			new $Set([1, 2, 3]),
			'returns the receiver Set without overlapping elements from the other Set'
		);

		var set3 = new $Set([1, 2, 3]);
		var set4 = new $Set([4, 5, 6]);
		var result2 = symmetricDifference(set3, set4);

		st.ok(result2 instanceof $Set, 'returns a Set');
		setEqual(
			st,
			result2,
			new $Set([1, 2, 3, 4, 5, 6]),
			'returns the combined Set since there are no overlapping elements in the other Set'
		);

		var setLikeIter = {
			has: function (x) { return x >= 0 && x % 2 === 0 && x < 10; },
			keys: function () {
				var i = 0;
				return {
					next: function fakeNext() {
						try {
							return {
								done: i >= 10,
								value: i
							};
						} finally {
							i += 2;
						}
					}
				};
			},
			size: 4
		};

		var result3 = symmetricDifference(set1, setLikeIter);
		st.ok(result3 instanceof $Set, 'returns a Set when `other` is a Set-like with a manual iterator');
		setEqual(
			st,
			result3,
			new $Set([0, 1, 3, 5, 8]),
			'returns the symmetricDifference of the two sets with a manual iterator'
		);

		st.end();
	});

	t.test('test262: test/built-ins/Set/prototype/symmetricDifference/add-not-called', function (st) {
		var s1 = new $Set([1, 2]);
		var s2 = new $Set([2, 3]);
		var expected = new $Set([1, 3]);

		var getCalls = st.capture($Set.prototype, 'add');

		var combined = symmetricDifference(s1, s2);

		st.deepEqual(combined, expected);
		st.ok(combined instanceof $Set, 'returns a Set');
		st.deepEqual(getCalls(), [], 'Add is never called');

		st.end();
	});

	t.test('test262: test/built-ins/Set/prototype/symmetricDifference/allows-set-like-object', function (st) {
		var s1 = new $Set([1, 2]);
		var s2 = {
			size: 2,
			has: function () {
				throw new EvalError('Set.prototype.symmetricDifference should not invoke .has on its argument');
			},
			keys: function () {
				return getIterator([2, 3]);
			}
		};
		var expected = new $Set([1, 3]);
		var combined = symmetricDifference(s1, s2);

		st.deepEqual(combined, expected);
		st.ok(combined instanceof $Set, 'returns a Set');

		st.end();
	});

	t.test('test262: test/built-ins/Set/prototype/symmetricDifference/combines-Map', function (st) {
		var s1 = new $Set([1, 2]);
		var m1 = new $Map([
			[2, 'two'],
			[3, 'three']
		]);
		var expected = new $Set([1, 3]);
		var combined = symmetricDifference(s1, m1);

		st.deepEqual(combined, expected);
		st.ok(combined instanceof $Set, 'returns a Set');

		st.end();
	});

	t.test('test262: test/built-ins/Set/prototype/symmetricDifference/combines-empty-sets', function (st) {
		var s1 = new $Set([]);
		var s2 = new $Set([1, 2]);
		var expected = new $Set([1, 2]);
		var combined = symmetricDifference(s1, s2);

		st.deepEqual(combined, expected);
		st.ok(combined instanceof $Set, 'returns a Set');

		var s3 = new $Set([1, 2]);
		var s4 = new $Set([]);
		expected = new $Set([1, 2]);
		combined = symmetricDifference(s3, s4);

		st.deepEqual(combined, expected);
		st.ok(combined instanceof $Set, 'returns a Set');

		var s5 = new $Set([]);
		var s6 = new $Set([]);
		expected = new $Set([]);
		combined = symmetricDifference(s5, s6);

		st.deepEqual(combined, expected);
		st.ok(combined instanceof $Set, 'returns a Set');

		st.end();
	});

	t.test('test262: test/built-ins/Set/prototype/symmetricDifference/combines-itself', function (st) {
		var s1 = new $Set([1, 2]);
		var expected = new $Set([]);
		var combined = symmetricDifference(s1, s1);

		st.deepEqual(combined, expected);
		st.ok(combined instanceof $Set, 'returns a Set');
		st.notEqual(combined, s1, 'The returned object is a new object');

		st.end();
	});

	t.test('test262: test/built-ins/Set/prototype/symmetricDifference/combines-same-sets', function (st) {
		var s1 = new $Set([1, 2]);
		var s2 = new $Set([1, 2]);
		var expected = new $Set([]);
		var combined = symmetricDifference(s1, s2);

		st.deepEqual(combined, expected);
		st.ok(combined instanceof $Set, 'returns a Set');
		st.notEqual(combined, s1, 'The returned object is a new object');
		st.notEqual(combined, s2, 'The returned object is a new object');

		st.end();
	});

	t.test('test262: test/built-ins/Set/prototype/symmetricDifference/combines-sets', function (st) {
		var s1 = new $Set([1, 2]);
		var s2 = new $Set([2, 3]);
		var expected = new $Set([1, 3]);
		var combined = symmetricDifference(s1, s2);

		st.deepEqual(combined, expected);
		st.ok(combined instanceof $Set, 'returns a Set');

		st.end();
	});

	t.test('test262: test/built-ins/Set/prototype/symmetricDifference/converts-negative-zero', function (st) {
		var setlikeWithMinusZero = {
			size: 1,
			has: function () {
				throw new EvalError('Set.prototype.symmetricDifference should not invoke .has on its argument when this.size > arg.size');
			},
			keys: function () {
				return getIterator([-0]);
			}
		};

		var s1 = new $Set([1, 2]);
		var expected = new $Set([1, 2, +0]);
		var combined = symmetricDifference(s1, setlikeWithMinusZero);

		st.deepEqual(combined, expected);
		st.ok(combined instanceof $Set, 'returns a Set');

		st.end();
	});

	t.test('test262: test/built-ins/Set/prototype/symmetricDifference/has-is-callable', function (st) {
		var s1 = new $Set([1, 2]);
		var s2 = {
			size: 2,
			has: undefined,
			keys: function () {
				return getIterator([2, 3]);
			}
		};
		st['throws'](
			function () { symmetricDifference(s1, s2); },
			TypeError,
			'GetSetRecord throws an error when has is undefined'
		);

		s2.has = {};
		st['throws'](
			function () { symmetricDifference(s1, s2); },
			TypeError,
			'GetSetRecord throws an error when has is not callable'
		);

		st.end();
	});

	t.test('test262: test/built-ins/Set/prototype/symmetricDifference/keys-is-callable', function (st) {
		var s1 = new $Set([1, 2]);
		var s2 = {
			size: 2,
			has: function () {},
			keys: undefined
		};
		st['throws'](
			function () { symmetricDifference(s1, s2); },
			TypeError,
			'GetSetRecord throws an error when keys is undefined'
		);

		s2.keys = {};
		st['throws'](
			function () { symmetricDifference(s1, s2); },
			TypeError,
			'GetSetRecord throws an error when keys is not callable'
		);

		st.end();
	});

	t.test('test262: test/built-ins/Set/prototype/symmetricDifference/result-order', function (st) {
		var s1 = new $Set([1, 2, 3, 4]);
		var s2 = new $Set([6, 5, 4, 3]);

		st.deepEqual(symmetricDifference(s1, s2), new $Set([1, 2, 6, 5]));

		var s3 = new $Set([6, 5, 4, 3]);
		var s4 = new $Set([1, 2, 3, 4]);

		st.deepEqual(symmetricDifference(s3, s4), new $Set([6, 5, 1, 2]));

		st.end();
	});

	t.test('test262: test/built-ins/Set/prototype/symmetricDifference/set-like-array', function (st) {
		var s1 = new $Set([1, 2]);
		var s2 = [5];
		s2.size = 3;
		s2.has = function () {
			throw new EvalError('Set.prototype.symmetricDifference should not invoke .has on its argument');
		};
		s2.keys = function () {
			return getIterator([2, 3, 4]);
		};

		var expected = new $Set([1, 3, 4]);
		var combined = symmetricDifference(s1, s2);

		st.deepEqual(combined, expected);
		st.ok(combined instanceof $Set, 'returns a Set');

		st.end();
	});

	t.test('test262: test/built-ins/Set/prototype/symmetricDifference/set-like-class-mutation', { skip: v.hasDescriptors }, function (st) {
		var baseSet = new $Set(['a', 'b', 'c', 'd', 'e']);

		var evilSetLike = {
			size: 4,
			has: undefined,
			keys: function () {
				var index = 0;
				var values = ['x', 'b', 'c', 'c'];
				return {
					next: function () {
						if (index === 0) {
							baseSet['delete']('b');
							baseSet['delete']('c');
							baseSet.add('b');
							baseSet.add('d');
						}
						return {
							done: index >= values.length,
							value: values[index++] // eslint-disable-line no-plusplus
						};
					}
				};
			}
		};
		Object.defineProperty(evilSetLike, 'has', {
			get: function () {
				baseSet.add('q');
				return function () {
					throw new EvalError('Set.prototype.symmetricDifference should not invoke .has on its argument');
				};
			}
		});

		var combined = symmetricDifference(baseSet, evilSetLike);
		var expectedCombined = new $Set(['a', 'c', 'd', 'e', 'q', 'x']);
		st.deepEqual(combined, expectedCombined);

		var expectedNewBase = new $Set(['a', 'd', 'e', 'q', 'b']);
		st.deepEqual(baseSet, expectedNewBase);

		st.end();
	});

	t.test('test262: test/built-ins/Set/prototype/symmetricDifference/size-is-a-number', function (st) {
		var s1 = new $Set([1, 2]);
		var s2 = {
			size: undefined,
			has: function () {},
			keys: function () {
				return getIterator([2, 3]);
			}
		};

		forEach([undefined, NaN, 'string'].concat(v.bigints), function (size) {
			s2.size = size;
			st['throws'](
				function () { symmetricDifference(s1, s2); },
				TypeError,
				'GetSetRecord throws an error when size is ' + debug(size)
			);
		});

		var coercionCalls = 0;
		s2.size = {
			valueOf: function () {
				coercionCalls += 1;
				return NaN;
			}
		};
		st['throws'](
			function () { symmetricDifference(s1, s2); },
			TypeError,
			'GetSetRecord throws an error when size coerces to NaN'
		);
		st.equal(coercionCalls, 1, 'GetSetRecord coerces size');

		st.end();
	});

	return t.comment('tests completed');
};
