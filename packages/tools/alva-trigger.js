#!/usr/bin/env node
const Path = require('path');
const execa = require('execa');
const yargs = require('yargs-parser');

const SHA1 = process.env.CIRCLE_SHA1;
const TAG = process.env.CIRCLE_TAG;
const PR_NUMBER = process.env.CI_PULL_REQUEST ? Path.basename(process.env.CI_PULL_REQUEST) : '';
const CHANNEL = PR_NUMBER ? `issue${PR_NUMBER}` : `branch${process.env.CIRCLE_BRANCH}`;

async function main(cli) {
	if (!cli.project) {
		console.log(`--project is required`);
		process.exit(1);
	}

	if (!TAG) {

		await execa('git', ['config', 'user.name', 'Alva Release']);
		await execa('git', ['config', 'user.email', 'hello@meetalva.io']);

		const projectPath = Path.resolve(process.cwd(), cli.project);
		const manifest = require(Path.join(projectPath, 'package.json'));

		console.log(`Trigger release for ${manifest.name}@${manifest.version}`);

		const channel = process.env.CIRCLE_BRANCH === 'master'
			? 'alpha'
			: CHANNEL;

		const version = `${manifest.version}-${channel}.${SHA1.slice(0, 5)}`;

		console.log(`${manifest.name}@${manifest.version} => ${manifest.name}@${version}`);

		await execa('yarn', ['version', '--new-version', version], { cwd: projectPath });

		console.log(`Triggered release via ${version}`);
	} else {
		console.log(`Tag is set, skipping: ${TAG}`);
	}
}

process.on('unhandledRejection', (_, error) => {
	console.trace(error);
	process.exit(1);
});

main(yargs(process.argv.slice(2))).catch(err => {
	throw err;
});
