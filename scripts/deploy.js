#!/usr/bin/env node
const ChildProcess = require('child_process');
const Path = require('path');
const fetch = require('node-fetch');

const SURGE_BIN = Path.resolve(process.cwd(), 'node_modules', '.bin', 'surge');

const PR_NUMBER = process.env.CI_PULL_REQUEST ? Path.basename(process.env.CI_PULL_REQUEST) : '';
const USER_NAME = process.env.CIRCLE_PROJECT_USERNAME;
const REPO_NAME = process.env.CIRCLE_PROJECT_REPONAME;
const SHA1 = process.env.CIRCLE_SHA1;
const GH_TOKEN = process.env.GH_AUTH_TOKEN;

const API_TARGET = PR_NUMBER ? `issues/${PR_NUMBER}` : `commits/${SHA1}`;
const TARGET_PATH = `repos/${USER_NAME}/${REPO_NAME}/${API_TARGET}/comments`;

async function main() {
	const args = process.argv.slice(2);
	const folder = args[0];

	if (!folder) {
		console.log(`two arguments are required: [folder]`);
	}

	const domain = `alva-${API_TARGET.split('/').join('-')}.surge.sh`;

	ChildProcess.spawnSync(SURGE_BIN, [folder, domain], {
		stdio: 'inherit'
	});

	const planned = `Deployed at: https://${domain}`;
	const comments = await fetch(`https://${GH_TOKEN}:x-oauth-basic@api.github.com/${TARGET_PATH}`).then(r => r.json());
	const previous = comments.find(comment => comment.body === planned);

	if (previous) {
		console.log(`Skipping notification due to previous deploy at ${previous.created_at}: ${previous.html_url}`);
		return;
	}

	const comment = await fetch(`https://${GH_TOKEN}:x-oauth-basic@api.github.com/${TARGET_PATH}`, {
		method: 'POST',
		body: JSON.stringify({ body: planned })
	}).then(r => r.json());

	console.log(`Commented at ${comment.html_url}`);
}

process.on('unhandledRejection', (_, error) => {
	console.trace(error);
	process.exit(1);
});

main()
	.catch(err => {
		throw err;
	})
