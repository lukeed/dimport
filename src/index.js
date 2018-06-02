export default function (url) {
	return fetch(url).then(r => r.text()).then(txt => {
		let m = { exports:{} };
		new Function('module', 'exports', txt)(m, m.exports);
		m.default = m.exports.default || m.exports; // boo
		return m;
	});
}
