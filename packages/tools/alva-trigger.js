#!/usr/bin/env node
const Path = require('path');
const execa = require('execa');
const yargs = require('yargs-parser');
const got = require('got');
const pgu = require('parse-github-url');
const semverUtils = require('semver-utils');
const sortBy = require('lodash').sortBy;

const TAG = process.env.CIRCLE_TAG;
const PR_NUMBER = process.env.CI_PULL_REQUEST ? Path.basename(process.env.CI_PULL_REQUEST) : '';
const CHANNEL = PR_NUMBER ? `issue-${PR_NUMBER}` : `branch`;

async function main(cli) {
	if (!cli.project) {
		console.log(`--project is required`);
		process.exit(1);
	}

	if (!process.env.GH_TOKEN) {
		console.log('env var GH_TOKEN is missing');
		process.exit(1);
	}

	if (!TAG) {
		if (process.env.CI === 'true' && !cli.dryRun) {
			await execa('git', ['config', 'user.name', 'Alva Release']);
			await execa('git', ['config', 'user.email', 'hello@meetalva.io']);
		}

		const prefix = cli.dryRun ? 'dry run: ' : '';
		const projectPath = Path.resolve(process.cwd(), cli.project);
		const manifest = require(Path.join(projectPath, 'package.json'));

		const [branch] = (await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'])).stdout.split(
			'\n'
		);

		const [hash] = (await execa('git', ['rev-parse', '--short', 'HEAD'])).stdout.split('\n');

		const channel = branch === 'master' ? 'alpha' : CHANNEL;

		const giturl =
			typeof manifest.repository === 'object' ? manifest.repository.url : manifest.repository;

		const repo = pgu(giturl);
		const { body: releases } = await got(`https://api.github.com/repos/${repo.repo}/releases`, {
			json: true,
			auth: process.env.GH_TOKEN
		});

		const current = semverUtils.parse(manifest.version);

		const versions = sortBy(
			releases
				.map(release => semverUtils.parse(release.name))
				.filter(
					r =>
						r.major === current.major &&
						r.minor === current.minor &&
						r.patch === current.patch
				)
				.filter(r => r.release.indexOf(channel) === 0)
				.map(r => {
					const raw = r.release.replace(new RegExp(`${channel}.`), '');

					if (!/^[0-9]{1,4}$/.test(raw)) {
						r.iteration = 0;
						return r;
					}

					r.iteration = parseInt(raw, 10);
					return r;
				}),
			'iteration'
		).reverse();

		const iteration = versions[0] ? versions[0].iteration + 1 : 1;

		console.log(`${prefix}trigger release for ${manifest.name}@${manifest.version} on ${branch}`);

		const version = `${manifest.version}-${channel}.${iteration}+${hash}`;
		console.log(`${prefix}${manifest.name}@${manifest.version} => ${manifest.name}@${version}`);

		if (cli.dryRun) {
			console.log(`${prefix}dry run: yarn version --new-version ${version}`);
		} else {
			await execa('yarn', ['version', '--new-version', version], { cwd: projectPath });
		}

		console.log(`${prefix}triggered release via ${version}`);
	} else {
		console.log(`${prefix}tag is set, skipping: ${TAG}`);
	}
}

process.on('unhandledRejection', (_, error) => {
	console.trace(error);
	process.exit(1);
});

main(yargs(process.argv.slice(2))).catch(err => {
	throw err;
});
