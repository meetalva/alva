#!/usr/bin/env node
const Fs = require('fs');
const Path = require('path');
const yargs = require('yargs-parser');
const semverUtils = require('semver-utils');
const Util = require('util');
const execa = require('execa');

const writeFile = Util.promisify(Fs.writeFile);

async function main(cli) {
	if (!cli.project) {
		console.log(`--project is required`);
		process.exit(1);
	}

	const projectPath = Path.resolve(process.cwd(), cli.project);
	const manifest = require(Path.join(projectPath, 'package.json'));

	const current = semverUtils.parse(manifest.version);
	const channel = current.release ? current.release.split('.')[0] : 'stable';

	manifest.build.publish = [
		...(manifest.build.publish || []),
		{
			provider: 'github',
			releaseType: channel === 'alpha' ? 'prerelease' : 'draft'
		}
	];

	if (!cli.dryRun) {
		await writeFile(Path.join(projectPath, 'package.json'), JSON.stringify(manifest, null, '  '));
	}

	if (channel === 'alpha') {
		manifest.build.productName = `Alva Canary`;
	}

	if (channel === 'beta') {
		manifest.build.productName = `Alva Beta`;
	}

	if (channel === 'alpha' && !cli.dryRun) {
		await execa.shell('cp ./src/resources/alpha/* ./src/resources', { cwd: projectPath });
	}

	if (cli.debug) {
		console.log(manifest);
	}

	if (!cli.dryRun) {
		await execa('electron-builder', ['--publish', 'always', ...cli._], {
			cwd: projectPath,
			stdio: 'inherit'
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
