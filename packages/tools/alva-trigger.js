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
	const mainManifest = require(Path.join(projectPath, 'package.json'));
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

	if (semver.gt(mainManifest.version, manifest.version)) {
		console.log(`${prefix}trigger full draft release for ${manifest.name}@${manifest.version}`);

		if (!cli.dryRun) {
			manifest.version = mainManifest.version;
			await writeFile(
				Path.join(projectPath, 'package.ncc.json'),
				JSON.stringify(manifest, null, '  ')
			);
		}

		if (cli.data) {
			const releases = sortedReleases.map(release => ({
				parsed: semverUtils.parse(release.tag_name),
				release
			}));

			await writeFile(
				cli.data,
				`export default ${JSON.stringify(
					{
						releases: sortedReleases,
						stable: releases.filter(r => !r.parsed.release).map(r => r.release.id),
						canary: releases
							.filter(r => r.parsed.release && r.parsed.release.includes('alpha'))
							.map(r => r.release.id),
						beta: releases
							.filter(r => r.parsed.release && r.parsed.release.includes('beta'))
							.map(r => r.release.id)
					},
					null,
					'  '
				)}`
			);

			return;
		}

		return;
	}

	if (cli.data) {
		const releases = sortedReleases.map(release => ({
			parsed: semverUtils.parse(release.tag_name),
			release
		}));

		await writeFile(
			cli.data,
			`export default ${JSON.stringify(
				{
					releases: sortedReleases,
					stable: releases.filter(r => !r.parsed.release).map(r => r.release.id),
					canary: releases
						.filter(r => r.parsed.release && r.parsed.release.includes('alpha'))
						.map(r => r.release.id),
					beta: releases
						.filter(r => r.parsed.release && r.parsed.release.includes('beta'))
						.map(r => r.release.id)
				},
				null,
				'  '
			)}`
		);

		return;
	}

	const [branch] = (await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'])).stdout.split('\n');
	const [hash] = (await execa('git', ['rev-parse', '--short', 'HEAD'])).stdout.split('\n');

	if (branch !== 'master' && !process.env.CIRCLE_PULL_REQUEST) {
		console.log(`${prefix}skipping, not on master or pr`);
	}

	const channel = branch === 'master' ? 'alpha' : 'pr';

	const major = semverUtils.parse(
		branch === 'master' ? semver.inc(manifest.version, 'major') : manifest.version
	);
	const majorTarget = `${major.major}.${major.minor}.${major.patch}-${channel}.0+${hash}`;

	const releaseVersions = sortedReleases
		.map(release => semverUtils.parse(release.tag_name))
		.filter(r => r.release)
		.filter(r => {
			return r.release.indexOf(channel) === 0;
		});

	const sv = r => r.major === major.major && r.minor === major.minor && r.patch === major.patch;

	const iterations = releaseVersions.filter(sv);
	const iteration = iterations[0] ? iterations[0].semver : majorTarget;

	const prSegments = process.env.CIRCLE_PULL_REQUEST
		? process.env.CIRCLE_PULL_REQUEST.split('/').filter(Boolean)
		: ['0'];

	const prNumber = prSegments[prSegments.length - 1] || '0';

	const version =
		channel === 'pr'
			? `${major.major}.${major.minor}.${major.patch}-${channel}.${prNumber}+${hash}`
			: semver.inc(iteration, 'prerelease');

	if (version === null) {
		console.error(`Failed to determine new version from ${iteration}`);
		process.exit(1);
	}

	console.log(`${prefix}${manifest.name}@${version}`);

	if (!cli.dryRun) {
		manifest.version = version;
		await writeFile(
			Path.join(projectPath, 'package.ncc.json'),
			JSON.stringify(manifest, null, '  ')
		);
	}
}

process.on('unhandledRejection', (_, error) => {
	console.trace(error);
	process.exit(1);
});

main(yargs(process.argv.slice(2))).catch(err => {
	throw err;
});
