// Mode :: "legacy"
// Much like "nomodule" but opens door to
// legacy/deprecated browsers that also
// do not support `new URL` and `fetch()`.
// NOTE: Requires `Promise` polyfill.

import imports from 'rewrite-imports';

var CACHE = {};

function run(url, str) {
	window.dimport = dimport;

	var key, keys=[], urls=[], mod={ exports:{} };

	var txt = imports(
			// Ensure full URLs & Gather static imports
			str.replace(/(import\s*.*\s*from\s*)['"]([^'"]+)['"];?/gi, function (_, state, loc) {
				loc = "'" + new URL(loc, url).href + "'";
				return state + (/\s*from\s*/.test(state) ? "'$dimport[" + (urls.push(loc) - 1) + "]';" : loc + ";");
			})

			// Attach ourself for dynamic imports
			.replace(/(^|\s|;)(import)(?=\()/g, '$1window.dimport')

			// Exports
			.replace(/export default/, 'module.exports =')
			.replace(/export\s+(const|function|class|let|var)\s+(.+?)(?=(\(|\s|=))/gi, function (_, type, name) {
				return keys.push(name) && (type + ' ' + name);
			})
			.replace(/export\s*\{([\s\S]*?)\}/gi, function (_, list) {
				var tmp, out='', arr=list.split(',');
				while (tmp = arr.shift()) {
					tmp = tmp.trim().split(' as ');
					out += 'exports.' + (tmp[1] || tmp[0]) + ' = ' + tmp[0] + ';\n';
				}
				return out;
			})
	, 'eval');

	for (keys.sort(); key = keys.shift();) {
		txt += '\nexports.' + key + ' = ' + key + ';';
	}

	return Promise.resolve(
		new Function('module', 'exports',
			urls.length
				? 'return Promise.all([' + urls.join() + '].map(window.dimport)).then(function($dimport){' + txt + '});'
				: txt
		)(mod, mod.exports)
	).then(function () {
		mod.exports.default = mod.exports.default || mod.exports;
		return mod.exports;
	});
}

function dimport(url) {
	try {
		return new Function("return import('" + url + "')").call();
	} catch (tag) {
		(tag = document.createElement('a')).href = url;
		url = tag.href;

		return CACHE[url]
			? Promise.resolve(CACHE[url])
			: new Promise(function (res, rej, xhr) {
				(xhr = new XMLHttpRequest).onerror = rej;
				xhr.open('GET', url, true);
				xhr.onload = function () {
					(xhr.status >= 400)
						? rej(new TypeError('Failed to fetch dynamically imported module: ' + url))
						: run(url, xhr.responseText).then(function (x) { return res(CACHE[url] = x) });
				};
				xhr.send();
			});
	}
}

// Runtime hookups
var tag = document !== void 0 && document.querySelector('script[data-main]');
if (tag) tag.text ? run(location.href, tag.text) : (tag=tag.getAttribute('data-main')) && dimport(tag);

export default dimport;
