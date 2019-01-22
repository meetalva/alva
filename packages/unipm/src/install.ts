import { download } from './download';
import * as T from './types';
import { resolve } from './resolve';
import { optimize } from './optimize';

const MemoryFs = require('memory-fs');
const throat = require('throat');

export async function install(pkg: string, userOptions: T.UserOptions): Promise<T.Fs> {
	const fs = (userOptions && userOptions.fs) || ((new MemoryFs() as any) as T.Fs);
	const fetch = userOptions.fetch;
	const cwd = userOptions.cwd || process.cwd();
	const options = { fs, fetch, cwd };

	const resolved = await resolve(pkg, options);
	await Promise.all(optimize(resolved).map(throat(5, p => download(p, 'node_modules', options))));
	return fs;
}
