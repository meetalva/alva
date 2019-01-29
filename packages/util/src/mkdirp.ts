import * as Fs from 'fs';
import * as Util from 'util';
import * as Path from 'path';

const promisify = require('util.promisify') as typeof Util.promisify;

export async function mkdirp(dir: string, opts: { fs: typeof Fs }): Promise<void> {
	const mkdir = promisify(opts.fs.mkdir).bind(opts.fs);
	const stat = promisify(opts.fs.stat).bind(opts.fs);

	try {
		await mkdir(dir);
	} catch (err) {
		switch (err.code) {
			case 'ENOENT':
				await mkdirp(Path.dirname(dir), opts);
				await mkdirp(dir, opts);
				break;
			default:
				try {
					const stats = await stat(dir);
					if (!stats.isDirectory()) {
						throw err;
					}
				} catch (statErr) {
					throw err;
				}
		}
	}
}
