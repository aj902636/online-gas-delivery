'use strict';
function apply(arr, input) {
	if (!Array.isArray(input)) {
		throw new TypeError('Expected an array');
	}

	arr.push.apply(arr, input);
}

module.exports = function (arr) {
	if (!Array.isArray(arr)) {
		throw new TypeError('Expected an array');
	}

	for (var i = 1; i < arguments.length; i++) {
		apply(arr, arguments[i]);
	}
};
