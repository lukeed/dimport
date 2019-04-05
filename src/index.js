function reset(key, tag) {
	tag.onerror = tag.onload = null;
	URL.revokeObjectURL(tag.src);
	delete window[key];
	tag.remove();
}

export default function (url) {
	try {
		return new Function(`return import('${url}')`).call();
	} catch (tag) {
		return new Promise((res, rej, key) => {
			tag = document.createElement('script');
			key = '$' + Math.random().toString(32).slice(2);
			url = new URL(url, location.href).href;
			tag.type = 'module';
			tag.onerror = () => {
				reset(key, tag);
				rej(new TypeError(`Failed to fetch dynamically imported module: ${url}`));
			};
			tag.onload = () => {
				res(window[key]);
				reset(key, tag);
			};
			tag.src = URL.createObjectURL(
				new Blob([`import * as m from '${url}';window.${key}=m;`], {
					type: 'application/javascript'
				})
			);
			document.head.appendChild(tag);
		});
	}
}
