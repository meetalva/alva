import * as npa from 'npm-package-arg';
import * as Fs from 'fs';
import * as Path from 'path';
import * as Util from 'util';
import * as execa from 'execa';
import * as semver from 'semver';

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

export async function getPackage(
	raw: string,
	opts: { cwd: string }
): Promise<PackageResult | Error> {
	try {
		const parsed = npa(raw);

		if (!TYPES.includes(parsed.type)) {
			return new Error(
				`${parsed.type} npm references are not supported. Specify one of ${TYPES.join(', ')}`
			);
		}

		const version = await getVersion(parsed);
		const id = [parsed.name, version].join('@');

		const yarn = getVendor('yarn.js');
		const cwd = Path.join(opts.cwd, id);

		await mkdirp(Path.join(cwd));
		await execa(yarn, ['add', id, ...ARGS], { cwd, stdio: 'inherit' });

		return {
			cwd,
			path: await resolvePkg(`${parsed.name}/package.json`, { cwd }),
			version,
			name: parsed.name
		};
	} catch (err) {
		return err;
	}
}

async function mkdirp(dir: string): Promise<void> {
	try {
		const mkdir = Util.promisify(Fs.mkdir);
		await mkdir(dir, { recursive: true });
	} catch (err) {
		if (err.code === 'EEXIST') {
			return;
		}

		throw err;
	}
}

async function getVersion(name: npa.Result): Promise<string> {
	if (name.type === 'version') {
		return name.fetchSpec;
	}

	const packument = await pacote.packument(name.name);

	if (name.type === 'tag') {
		const version = packument['dist-tags'][name.fetchSpec];

		if (typeof version !== 'string') {
			throw new Error(`Could not determine version of ${name.name} for tag ${name.fetchSpec}`);
		}

		return version;
	}

	if (name.type === 'range') {
		const versions = Object.keys(packument.versions).sort(semver.compare);
		const version = semver.maxSatisfying(versions, name.fetchSpec);

		if (typeof version !== 'string') {
			throw new Error(
				`Could not find matching version of ${name.name} for range ${name.fetchSpec}`
			);
		}

		return version;
	}
}

function getVendor(name: string): string {
	const prodVendor = Path.join(__dirname, 'vendor', name);
	const devVendor = Path.join(__dirname, '..', '..', 'vendor', name);
	return [prodVendor, devVendor].find(Fs.existsSync);
}
