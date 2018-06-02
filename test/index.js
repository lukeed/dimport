const test = require('tape');
const lib = require('..');

// main internal bits
function foo(txt) {
	let m = { exports:{} };
	new Function('module', 'exports', txt)(m, m.exports);
	m.default = m.exports.default || m.exports;
	return m;
}

test('exports', t => {
	t.is(typeof lib, 'function', 'exports a function');
	t.end();
});

test('commonjs :: module.exports', t => {
	let mod = foo('module.exports = function (a, b) { return a + b; }');
	t.is(typeof mod, 'object', 'returns a object from contents');
	t.ok(!!mod.default, '~> contains "default" key');

	t.is(typeof mod.default, 'function', '~~> is function');
	t.is(mod.default(18, 24), 42, '~> function is valid');
	t.end();
});

test('commonjs :: exports.*', t => {
	let mod = foo('exports.foo = 123; exports.bar = function (val) { return `${val}-${exports.foo}`; };');
	t.is(typeof mod, 'object', 'returns an object from contents');

	t.ok(!!mod.default, '~> contains "default" key');
	t.is(typeof mod.default, 'object', '~~> is object');

	let obj = mod.default;
	t.is(Object.keys(obj).length, 2, '~> object has two keys');
	t.is(obj.foo, 123, 'received valid number type from `exports.foo`');
	t.is(typeof obj.bar, 'function', 'received valid function type from `exports.bar`');
	t.is(obj.bar('hello'), 'hello-123', '~> function is valid');
	t.end();
});

test('commonjs :: module.exports.*', t => {
	let mod = foo('module.exports.foo = 123; module.exports.bar = function (val) { return `${val}-${module.exports.foo}`; };');
	t.is(typeof mod, 'object', 'returns an object from contents');

	t.ok(!!mod.default, '~> contains "default" key');
	t.is(typeof mod.default, 'object', '~~> is object');

	let obj = mod.default;
	t.is(Object.keys(obj).length, 2, '~> object has two keys');
	t.is(obj.foo, 123, 'received valid number type from `module.exports.foo`');
	t.is(typeof obj.bar, 'function', 'received valid function type from `module.exports.bar`');
	t.is(obj.bar('hello'), 'hello-123', '~> function is valid');
	t.end();
});

test('umd', t => {
	let mod = foo('!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.import=t()}(this,function(){return function(a, b){ return a + b }});');
	t.is(typeof mod, 'object', 'returns an object from contents');
	t.ok(!!mod.default, '~> contains "default" key');

	let fn = mod.default;
	t.is(typeof fn, 'function', 'returns a function from contents');
	t.is(fn(18, 24), 42, '~> function is valid');
	t.end();
});
