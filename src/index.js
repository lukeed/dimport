const MAP = {};
export default function (url) {
	return (MAP[url] = MAP[url] || fetch(url).then(r => r.text()).then(txt => {
		let m = { exports:{} };
		new Function('module', 'exports', txt)(m, m.exports);
		return m.exports;
	}));
}
