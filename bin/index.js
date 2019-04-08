const { resolve } = require('path');
const { promisify } = require('util');
const { execFile } = require('child_process');
const { readFile, writeFile } = require('fs');

const run = promisify(execFile);
const read = promisify(readFile);
const write = promisify(writeFile);

const bundt = require.resolve('bundt');
const rewrite = require.resolve('rewrite-imports');

(async function () {
	// Modify dependency for inline usage
	const dep = await read(rewrite, 'utf8').then(x => x.replace('module.exports = function ', 'function imports'));

	// Now inline the "nomodule" dependency
	const temp = await read('src/nomodule.js', 'utf8').then(x => x.replace(`import imports from 'rewrite-imports';`, dep));

	// Write this to temporary file
	await write('temp.js', temp);

	// Build "nomodule" first
	let pid = await run(bundt, ['temp.js', '--unpkg', '--module']);
	if (pid.stderr) return process.stderr.write(pid.stderr);
	process.stdout.write(pid.stdout);

	// UMD should be "default" for unpkg access
	await run('mv', ['dist/index.min.js', 'dist/index.js']);
	await run('mv', ['dist', 'nomodule']);
	await run('rm', ['temp.js']);

	// Now build "module" file
	let { stderr, stdout } = await run(bundt);
	if (stderr) return process.stderr.write(stderr);
	process.stdout.write(stdout);
})().catch(err => {
	console.error('Caught: ', err);
	process.exit(1);
});
