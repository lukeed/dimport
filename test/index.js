const test = require('tape');
const lib = require('..');

// main internal bits
function foo(txt) {
	let m = { exports:{} };
	new Function('module', 'exports', txt)(m, m.exports);
	return m.exports;
}

test('exports', t => {
	t.is(typeof lib, 'function', 'exports a function');
	t.end();
});

test('commonjs :: module.exports', t => {
	let fn = foo('module.exports = function (a, b) { return a + b; }');
	t.is(typeof fn, 'function', 'returns a function from contents');
	t.is(fn(18, 24), 42, '~> function is valid');
	t.end();
});

test('commonjs :: exports.*', t => {
	let obj = foo('exports.foo = 123; exports.bar = function (val) { return `${val}-${exports.foo}`; };');
	t.is(typeof obj, 'object', 'returns an object from contents');
	t.is(Object.keys(obj).length, 2, '~> object has two keys');
	t.is(obj.foo, 123, 'received valid number type from `exports.foo`');
	t.is(typeof obj.bar, 'function', 'received valid function type from `exports.bar`');
	t.is(obj.bar('hello'), 'hello-123', '~> function is valid');
	t.end();
});

test('commonjs :: module.exports.*', t => {
	let obj = foo('module.exports.foo = 123; module.exports.bar = function (val) { return `${val}-${module.exports.foo}`; };');
	t.is(typeof obj, 'object', 'returns an object from contents');
	t.is(Object.keys(obj).length, 2, '~> object has two keys');
	t.is(obj.foo, 123, 'received valid number type from `exports.foo`');
	t.is(typeof obj.bar, 'function', 'received valid function type from `exports.bar`');
	t.is(obj.bar('hello'), 'hello-123', '~> function is valid');
	t.end();
});

test('umd', t => {
	let fn = foo('!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.import=t()}(this,function(){return function(a, b){ return a + b }});');
	t.is(typeof fn, 'function', 'returns a function from contents');
	t.is(fn(18, 24), 42, '~> function is valid');
	t.end();
});
