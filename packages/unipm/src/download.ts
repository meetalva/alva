import * as pako from 'pako';
import * as Url from 'url';
import * as Path from 'path';
import * as Util from 'util';

import * as T from './types';
import { ResolvedPackage } from './resolve';

const promisify = require('util-promisify') as typeof Util.promisify;
const untar = require('untar.js');
const throat = require('throat');

export async function download(
	resolved: ResolvedPackage,
	base: string,
	options: T.Options
): Promise<void> {
	const fetch = options.fetch;
	const writeFile = promisify(options.fs.writeFile.bind(options.fs));
	const pkgBase = Path.resolve(options.cwd, base, resolved.packageName.full);

	const tarballPath = Url.parse(resolved.packument.dist.tarball).pathname;
	const tarballUrl = `https://registry.npmjs.cf${tarballPath}`;
	const tarballResponse = await fetch(tarballUrl);

	if (!tarballResponse.ok) {
		throw new Error(
			`Could not fetch tarball for ${resolved.packageName.full}: ${tarballResponse.statusText}`
		);
	}

	const data = new Uint8Array(await tarballResponse.arrayBuffer());
	const inflated = pako.inflate(data);

	await Promise.all(
		untar.untar(inflated).map(async file => {
			const path = Path.join(pkgBase, file.name.replace(/^package\//, ''));
			await mkdirp(Path.dirname(path), { fs: options.fs });
			await writeFile(path, Buffer.from(file.fileData));
		})
	);

	await Promise.all(
		resolved.dependencies.map(dep => download(dep, Path.join(pkgBase, 'node_modules'), options))
	);
}

async function mkdirp(
	dirname: string,
	opts: { fs: T.Fs; cache?: Map<string, true | Error> }
): Promise<void> {
	const cache = opts.cache || new Map();
	const mkdir = promisify(opts.fs.mkdir.bind(opts.fs));
	const fragments = dirname.split(Path.sep);

	await Promise.all(
		fragments.map(
			throat(1, async (_, i) => {
				const path = `/${Path.join(...fragments.slice(0, i + 1))}`;

				if (cache.has(path)) {
					const cached = cache.get(path);
					if (cached !== true) {
						throw cached;
					}
				}

				try {
					if (path === '.') {
						return;
					}

					await mkdir(path);
					cache.set(path, true);
				} catch (err) {
					if (err.code === 'EEXIST') {
						return;
					}

					cache.set(path, err);
					throw err;
				}
			})
		)
	);
}
