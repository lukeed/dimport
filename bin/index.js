/* eslint-disable no-console */
const { join } = require('path');
const { promisify } = require('util');
const { execFile } = require('child_process');

const run = promisify(execFile);
const microbundle = require.resolve('microbundle');
const BIN = join(microbundle, '../cli.js');

async function group(name, toMove) {
	let { stdout } = await run(BIN, [`src/${name}.js`, '--external=none', '--no-sourcemap']);
	process.stdout.write(
		stdout.replace('dist', `"${name}"`) + '\n'
	);

	// UMD should be "default" for unpkg access
	// ~> needs "index.js" since no "unpkg" key config
	if (toMove) {
		await run('mv', ['dist/index.min.js', 'dist/index.js']);
		await run('mv', ['dist', name]);
	}
}

(async function () {
	// Build modes (order matters)
	await group('nomodule', true);
	await group('legacy', true);
	await group('module');
})().catch(err => {
	console.error('Caught: ', err);
	process.exit(1);
});
