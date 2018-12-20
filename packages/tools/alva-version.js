#!/usr/bin/env node
const Path = require('path');
const yargs = require('yargs-parser');

async function main(cli) {
	if (!cli.project) {
		console.log(`--project is required`);
		process.exit(1);
	}

	const projectPath = Path.resolve(process.cwd(), cli.project);
	const manifest = require(Path.join(projectPath, 'package.json'));
	console.log(manifest.version);
}

process.on('unhandledRejection', (_, error) => {
	console.trace(error);
	process.exit(1);
});

main(yargs(process.argv.slice(2))).catch(err => {
	throw err;
});
