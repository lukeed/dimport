import imports from 'rewrite-imports';

var CACHE = {};

function run(url, str) {
	window.dimport = dimport;

	var key, keys=[], urls=[], idx=0;
	var mod = { exports: {} };

	var txt = imports(
		str
			// Ensure full URLs & Gather static imports
			.replace(/(import\s*.*\s*from\s*)['"]([^'"]+)['"];?/gi, (_, state, loc) => {
				loc = "'" + new URL(loc, url).href + "'";
				return state + (/\s*from\s*/.test(state) ? `'$dimport[${urls.push(loc) - 1}]';` : `${loc};`);
			})

			// Attach ourself for dynamic imports
			.replace(/(^|\s|;)(import)(?=\()/g, '$1window.dimport')

			// Exports
			.replace(/export default/, 'module.exports =')
			.replace(/export\s+(const|function|class|let|var)\s+(.+?)(?=(\(|\s|\=))/gi, (_, type, name) => keys.push(name) && (type + ' ' + name))
			.replace(/export\s*\{([\s\S]*?)\}/gi, (_, list) => {
				var tmp, out='', arr=list.split(',');
				while (tmp = arr.shift()) {
					tmp = tmp.trim().split(' as ');
					out += `exports.${tmp[1] || tmp[0]} = ${tmp[0]};\n`;
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
				? `return Promise.all([${urls.join()}].map(window.dimport)).then(function($dimport){${txt}});`
				: txt
		)(mod, mod.exports)
	).then(() => {
		mod.exports.default = mod.exports.default || mod.exports;
		return mod.exports;
	});
}

export default function dimport(url) {
	try {
		return new Function(`return import('${url}')`).call();
	} catch (err) {
		url = new URL(url, location.href).href;

		return CACHE[url]
			? Promise.resolve(CACHE[url])
			: fetch(url)
				.then(r => r.text())
				.then(run.bind(run, url))
				.then(x => (CACHE[url] = x));
	}
}
