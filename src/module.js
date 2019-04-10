// Mode :: "module"
// Meant for the (few) browsers that
// do support <script type=module /> and
// do support static `import` statements,
// but do not support dynamic imports.

function reset(key, tag) {
	tag.onerror = tag.onload = null;
	URL.revokeObjectURL(tag.temp);
	URL.revokeObjectURL(tag.src);
	delete window[key];
	tag.remove();
}

function toBlob(url, txt) {
	return URL.createObjectURL(
		new Blob([
			// Ensure full URLs & rewrite dynamic imports
			txt.replace(/(^|\s|;)(import\s*\(|import\s*.*\s*from\s*)['"]([^'"]+)['"]/gi, function (_, pre, req, loc) {
				return pre + (/\s+from\s*/.test(req) ? req : 'window.dimport(') + "'" + new URL(loc, url) + "'";
			})
			// Ensure we caught all dynamics (multi-line clauses)
			.replace(/(^|\s|;)(import)(?=\()/g, '$1window.dimport')
		], {
			type: 'application/javascript'
		})
	);
}

var CACHE = {};

function dimport(url) {
	url = new URL(url, location.href).href;

	try {
		return new Function("return import('" + url + "')").call();
	} catch (tag) {
		return CACHE[url]
			? Promise.resolve(CACHE[url])
			: fetch(url).then(function (r) {
					return r.text();
				})
				.then(function (txt) {
					window.dimport = dimport;
					return new Promise(function (res, rej, key) {
						tag = document.createElement('script');
						key = '$' + Math.random().toString(32).slice(2);
						tag.type = 'module';

						tag.onerror = function () {
							reset(key, tag);
							rej(new TypeError('Failed to fetch dynamically imported module: ' + url));
						};

						tag.onload = function () {
							res(CACHE[url] = window[key]);
							reset(key, tag);
						};

						tag.temp = toBlob(url, txt);
						tag.src = toBlob(url, "import * as m from '" + tag.temp + "';window." + key + "=m;");

						document.head.appendChild(tag);
					});
				});
	}
}

// Runtime hookups
var tag = document !== void 0 && document.currentScript || document.querySelector('script[data-main]');
if (tag) tag.text ? dimport(toBlob(location.href, tag.text)) : (tag=tag.getAttribute('data-main')) && dimport(tag);

export default dimport;
