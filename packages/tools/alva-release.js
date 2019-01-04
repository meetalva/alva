#!/usr/bin/env node
const Path = require('path');
const execa = require('execa');
const yargs = require('yargs-parser');

const TAG = process.env.CIRCLE_TAG;

async function main(cli) {
	if (!cli.project) {
		console.log(`--project is required`);
		process.exit(1);
	}

	const [branch] = (await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'])).stdout.split('\n');
	const isDraft = branch !== 'master';
	const projectPath = Path.resolve(process.cwd(), cli.project);
	const prefix = cli.dryRun ? 'dry run: ' : '';

	if (cli.dryRun) {
		console.log(`${prefix}electron-builder ${['-c.github.releaseType', releaseType, '--publish', 'always', ...cli._].join(' ')}`);
	} else {
		await execa('electron-builder', ['--publish', 'always', ...cli._], {
			cwd: projectPath,
			stdio: 'inherit',
			env: {
				EP_DRAFT: isDraft ? 'true' : 'false',
				EP_PRE_RELEASE: isDraft && !TAG ? 'false' : 'true'
			}
		});
	}
}

process.on('unhandledRejection', (_, error) => {
	console.trace(error);
	process.exit(1);
});

main(yargs(process.argv.slice(2))).catch(err => {
	throw err;
});
