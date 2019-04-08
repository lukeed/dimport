const { resolve } = require('path');
const { promisify } = require('util');
const { execFile } = require('child_process');
const { readFile, writeFile } = require('fs');

const run = promisify(execFile);
const read = promisify(readFile);
const write = promisify(writeFile);

const bundt = require.resolve('bundt');
const rewrite = require.resolve('rewrite-imports');

async function toMode(name, func) {
	if (func) {
		let data = await read(`src/${name}.js`, 'utf8').then(func);
		await write('temp.js', data);
	}

	console.log(`Building "${name}" files`);
	let pid = await run(bundt, func ? ['temp.js', '--unpkg', '--module'] : ['src/module.js']);
	process.stdout.write(pid.stdout);

	if (pid.stderr) {
		process.stderr.write(pid.stderr);
		return process.exit(1);
	}

	// UMD should be "default" for unpkg access
	// ~> needs "index.js" since no "unpkg" key config
	if (func) {
		await run('mv', ['dist/index.min.js', 'dist/index.js']);
		await run('mv', ['dist', name]);
		await run('rm', ['temp.js']);
	}
}

(async function () {
	// Modify dependency for inline usage
	const dep = await read(rewrite, 'utf8').then(x => x.replace('module.exports = function ', 'function imports'));
	const inject = x => x.replace(`import imports from 'rewrite-imports';`, dep);

	// Build modes (order matters)
	await toMode('nomodule', inject);
	await toMode('legacy', inject);
	await toMode('module');
})().catch(err => {
	console.error('Caught: ', err);
	process.exit(1);
});
