import * as npa from 'npm-package-arg';
import * as Fs from 'fs';
import * as Path from 'path';
import * as semver from 'semver';
import { mkdirp } from '@meetalva/util';
import * as ChildProcess from 'child_process';

const pacote = require('pacote');
const resolvePkg = require('resolve-pkg');

const ARGS = [
	'--exact',
	'--ignore-scripts',
	'--no-lockfile',
	'--non-interactive',
	'--no-bin-links',
	'--ignore-engines',
	'--skip-integrity-check'
];

const TYPES = ['version', 'tag', 'range'];

export interface PackageResult {
	cwd: string;
	path: string;
	version: string;
	name: string;
}

function fork(command: string, args: string[], opts: ChildProcess.ForkOptions): Promise<string> {
	return new Promise((resolve, reject) => {
		const cp = ChildProcess.fork(command, args, { ...opts, stdio: 'pipe' });
		const err: string[] = [];
		const out: string[] = [];

		if (cp.stdout !== null) {
			cp.stdout.on('data', data => out.push(data));
		}

		if (cp.stderr !== null) {
			cp.stderr.on('data', data => err.push(data));
		}

		cp.once('error', reject);

		cp.once('exit', code => {
			if (code !== 0) {
				return reject(
					`${command} exited with code ${code}: ${out.join('\n')} ${err.join('\n')}`
				);
			}

			resolve(out.join('\n'));
		});
	});
}

export async function getPackage(
	raw: string,
	opts: { cwd: string; dirname: string; appPath: string }
): Promise<PackageResult | Error> {
	try {
		const parsed = npa(raw);

		if (!TYPES.includes(parsed.type)) {
			return new Error(
				`${parsed.type} npm references are not supported. Specify one of ${TYPES.join(', ')}`
			);
		}

		const version = await getVersion(parsed);

		if (!version) {
			return new Error(`could not determine version for ${raw}`);
		}

		const id = [parsed.name, version].join('@');

		const vendorDir = getVendorDir(opts);
		const yarn = Path.join(vendorDir, 'yarn.js');
		const cwd = Path.join(opts.cwd, id);

		await mkdirp(Path.join(cwd), { fs: Fs });
		await fork(yarn, ['add', id, ...ARGS], { cwd });

		return {
			cwd,
			path: await resolvePkg(`${parsed.name}/package.json`, { cwd }),
			version,
			name: parsed.name!
		};
	} catch (err) {
		err.message = [err.message, err.stdout, err.sterr, err.cwd ? `cwd: ${err.cwd}` : '']
			.filter(Boolean)
			.join('\n');
		return err;
	}
}

async function getVersion(name: npa.Result): Promise<string | undefined> {
	if (name.type === 'version') {
		return name.fetchSpec!;
	}

	const packument = await pacote.packument(name.name);

	if (name.type === 'tag') {
		const version = packument['dist-tags'][name.fetchSpec!];

		if (typeof version !== 'string') {
			throw new Error(`Could not determine version of ${name.name} for tag ${name.fetchSpec}`);
		}

		return version;
	}

	if (name.type === 'range') {
		const versions = Object.keys(packument.versions).sort(semver.compare);
		const spec = typeof name.fetchSpec === 'string' ? name.fetchSpec : 'latest';
		const version = semver.maxSatisfying(versions, spec);

		if (typeof version !== 'string') {
			throw new Error(
				`Could not find matching version of ${name.name} for range ${name.fetchSpec}`
			);
		}

		return version;
	}
}

function getVendorDir(opts: { cwd: string; appPath: string; dirname: string }): string {
	const vendors = [
		Path.join(opts.appPath.replace('app.asar', 'app.asar.unpacked'), 'vendor'),
		Path.join(opts.dirname, 'vendor')
	];

	const vendor = vendors.find(dir => {
		try {
			return Fs.existsSync(dir) && Fs.statSync(dir).isDirectory();
		} catch (err) {
			return false;
		}
	});

	if (!vendor) {
		throw new Error(`Could not find vendor directory at ${vendors.join(', ')}`);
	}

	return vendor;
}
