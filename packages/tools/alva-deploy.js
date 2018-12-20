#!/usr/bin/env node
const ChildProcess = require('child_process');
const Path = require('path');
const fetch = require('node-fetch');
const yargs = require('yargs-parser');

const SURGE_BIN = Path.resolve(process.cwd(), 'node_modules', '.bin', 'surge');

const PR_NUMBER = process.env.CI_PULL_REQUEST ? Path.basename(process.env.CI_PULL_REQUEST) : '';
const USER_NAME = process.env.CIRCLE_PROJECT_USERNAME;
const REPO_NAME = process.env.CIRCLE_PROJECT_REPONAME;
const SHA1 = process.env.CIRCLE_SHA1;
const GH_TOKEN = process.env.GH_AUTH_TOKEN || process.env.GH_TOKEN;

const API_TARGET = PR_NUMBER ? `issues/${PR_NUMBER}` : `commits/${SHA1}`;
const TARGET_SUB = PR_NUMBER ? `issues-${PR_NUMBER}` : `commits-${SHA1.slice(0, 5)}`;
const TARGET_PATH = `repos/${USER_NAME}/${REPO_NAME}/${API_TARGET}/comments`;

async function main(cli) {
	if (!cli.project) {
		console.log(`--project is required`);
		process.exit(1);
	}

	const domain = `alva-${TARGET_SUB}.surge.sh`;

	ChildProcess.spawnSync(SURGE_BIN, [cli.project, domain], {
		stdio: 'inherit'
	});

	const planned = `Deployed at: https://${domain}`;
	const rawComments = await fetch(`https://${GH_TOKEN}:x-oauth-basic@api.github.com/${TARGET_PATH}`).then(r => r.json());

	const comments = Array.isArray(rawComments)
		? rawComments
		: [];

	if (!Array.isArray(rawComments)) {
		console.error(`Could not fetch previous comments: ${JSON.stringify(rawComments)}`);
	}

	const previous = comments.find(comment => comment.body === planned);

	if (previous) {
		console.log(`Skipping notification due to previous deploy at ${previous.created_at}: ${previous.html_url}`);
		return;
	}

	const comment = await fetch(`https://${GH_TOKEN}:x-oauth-basic@api.github.com/${TARGET_PATH}`, {
		method: 'POST',
		body: JSON.stringify({ body: planned })
	}).then(r => r.json());

	if (!comment.html_url) {
		console.error(comment);
	}

	console.log(`Commented at ${comment.html_url}`);
}

process.on('unhandledRejection', (_, error) => {
	console.trace(error);
	process.exit(1);
});

main(yargs(process.argv.slice(2)))
	.catch(err => {
		throw err;
	})
