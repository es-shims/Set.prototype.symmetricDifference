import callBind from 'call-bind';
import RequireObjectCoercible from 'es-object-atoms/RequireObjectCoercible';

import getPolyfill from 'set.prototype.symmetricdifference/polyfill';

const bound = callBind(getPolyfill());

export default function symmetricDifference(set, other) {
	RequireObjectCoercible(set);
	return bound(set, other);
}

export { default as getPolyfill } from 'set.prototype.symmetricdifference/polyfill';
export { default as implementation } from 'set.prototype.symmetricdifference/implementation';
export { default as shim } from 'set.prototype.symmetricdifference/shim';
