#!/usr/bin/env node
const Fs = require('fs');
const Path = require('path');
const execa = require('execa');
const yargs = require('yargs-parser');
const got = require('got');
const pgu = require('parse-github-url');
const semverUtils = require('semver-utils');
const semver = require('semver');
const Util = require('util');

const writeFile = Util.promisify(Fs.writeFile);

async function main(cli) {
	if (!cli.project) {
		console.log(`--project is required`);
		process.exit(1);
	}

	if (!process.env.GH_TOKEN) {
		console.log('env var GH_TOKEN is missing');
		process.exit(1);
	}

	const prefix = cli.dryRun ? 'dry run: ' : '';

	if (process.env.CI === 'true' && !cli.dryRun) {
		await execa('git', ['config', 'user.name', 'Alva Release']);
		await execa('git', ['config', 'user.email', 'hello@meetalva.io']);
	}

	const projectPath = Path.resolve(process.cwd(), cli.project);
	const manifest = require(Path.join(projectPath, 'package.ncc.json'));

	const giturl =
		typeof manifest.repository === 'object' ? manifest.repository.url : manifest.repository;

	const repo = pgu(giturl);
	const { body: releases } = await got(`https://api.github.com/repos/${repo.repo}/releases`, {
		json: true,
		auth: process.env.GH_TOKEN
	});

	const sortedReleases = releases.slice(0).sort((a, b) => {
		return semver.rcompare(a.tag_name, b.tag_name);
	});

	const latestRelease = sortedReleases[0];

	if (latestRelease && semver.gt(manifest.version, latestRelease.tag_name)) {
		console.log(`${prefix}trigger full draft release for ${manifest.name}@${manifest.version}`);
		return;
	}

	const [branch] = (await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'])).stdout.split('\n');
	const [hash] = (await execa('git', ['rev-parse', '--short', 'HEAD'])).stdout.split('\n');

	const channel = branch === 'master'
		? 'alpha'
		: branch.split('/').join('-');

	const major = semverUtils.parse(branch === 'master' ? semver.inc(manifest.version, 'major') : manifest.version);
	const majorTarget = `${major.major}.${major.minor}.${major.patch}-${channel}.0+${hash}`;

	const releaseVersions = sortedReleases
		.map(release => semverUtils.parse(release.tag_name))
		.filter(r => r.release)
		.filter(r => {
			return r.release.indexOf(channel) === 0;
		});

	const sv = r =>
		r.major === majorTarget.major &&
		r.minor === majorTarget.minor &&
		r.patch === majorTarget.patch;

	const iterations = releaseVersions.filter(sv);
	const iteration = iterations[0] || majorTarget;
	const version =  semver.inc(iteration, 'prerelease');

	console.log(`${prefix}${manifest.name}@${version}`);

	if (!cli.dryRun) {
		manifest.version = version;
		await writeFile(Path.join(projectPath, 'package.ncc.json'), JSON.stringify(manifest, null, '  '));
	}
}

process.on('unhandledRejection', (_, error) => {
	console.trace(error);
	process.exit(1);
});

main(yargs(process.argv.slice(2))).catch(err => {
	throw err;
});
