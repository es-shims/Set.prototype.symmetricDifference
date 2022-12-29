# set.prototype.symmetricdifference <sup>[![Version Badge][npm-version-svg]][package-url]</sup>

[![github actions][actions-image]][actions-url]
[![coverage][codecov-image]][codecov-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

[![npm badge][npm-badge-png]][package-url]

ES Proposal spec-compliant shim for Set.prototype.symmetricDifference. Invoke its "shim" method to shim `Set.prototype.symmetricDifference` if it is unavailable or noncompliant.

This package implements the [es-shim API](https://github.com/es-shims/api) interface. It works in an ES3-supported environment, and complies with the [proposed spec](https://github.com/tc39/proposal-set-methods). When shimmed, it uses [`es-set`](https://npmjs.com/es-set) to shim the `Set` implementation itself if needed.

Most common usage:
```js
var assert = require('assert');
var symmetricDifference = require('set.prototype.symmetricdifference');

var set1 = new Set([1, 2]);
var set2 = new Set([2, 3]);
var result = symmetricDifference(set1, set2);

assert.deepEqual(result, new Set([1, 3]));

symmetricDifference.shim();

var shimmedResult = set1.symmetricDifference(set2);
assert.deepEqual(shimmedResult, new Set([1, 3]));
```

## Tests
Simply clone the repo, `npm install`, and run `npm test`

## Set Method Packages
 - [union](https://npmjs.com/set.prototype.union)
 - [intersection](https://npmjs.com/set.prototype.intersection)
 - [difference](https://npmjs.com/set.prototype.difference)
 - [symmetricDifference](https://npmjs.com/set.prototype.symmetricdifference)
 - [isSubsetOf](https://npmjs.com/set.prototype.issubsetof)
 - [isSupersetOf](https://npmjs.com/set.prototype.issupersetof)
 - [isDisjointFrom](https://npmjs.com/set.prototype.isdisjointfrom)

[package-url]: https://npmjs.com/package/set.prototype.symmetricdifference
[npm-version-svg]: http://versionbadg.es/es-shims/Set.prototype.symmetricDifference.svg
[deps-svg]: https://david-dm.org/es-shims/Set.prototype.symmetricDifference.svg
[deps-url]: https://david-dm.org/es-shims/Set.prototype.symmetricDifference
[dev-deps-svg]: https://david-dm.org/es-shims/Set.prototype.symmetricDifference/dev-status.svg
[dev-deps-url]: https://david-dm.org/es-shims/Set.prototype.symmetricDifference#info=devDependencies
[testling-svg]: https://ci.testling.com/es-shims/Set.prototype.symmetricDifference.png
[testling-url]: https://ci.testling.com/es-shims/Set.prototype.symmetricDifference
[npm-badge-png]: https://nodei.co/npm/set.prototype.symmetricdifference.png?downloads=true&stars=true
[license-image]: http://img.shields.io/npm/l/set.prototype.symmetricdifference.svg
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/set.prototype.symmetricdifference.svg
[downloads-url]: http://npm-stat.com/charts.html?package=set.prototype.symmetricdifference
[codecov-image]: https://codecov.io/gh/es-shims/Set.prototype.symmetricDifference/branch/main/graphs/badge.svg
[codecov-url]: https://app.codecov.io/gh/es-shims/Set.prototype.symmetricDifference/
[actions-image]: https://img.shields.io/endpoint?url=https://github-actions-badge-u3jn4tfpocch.runkit.sh/es-shims/Set.prototype.symmetricDifference
[actions-url]: https://github.com/es-shims/Set.prototype.symmetricDifference/actions
