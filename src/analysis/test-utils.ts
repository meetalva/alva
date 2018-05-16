import * as Fs from 'fs';
import * as FsExtra from 'fs-extra';
import * as Path from 'path';
import * as readdir from 'readdir-enhanced';
import * as tempy from 'tempy';

export const createFileSystem = (data?: { [path: string]: string }): typeof Fs => {
	const MemoryFs = require('memory-fs');
	const fs: typeof Fs = new MemoryFs();

	Object.entries(data || {}).forEach(([rawPath, content]) => {
		const path = rawPath.charAt(0) !== '/' ? `/${rawPath}` : rawPath;
		const dirname = Path.posix.dirname(path);

		dirname
			.split('/')
			.map((_, index, fragments) => fragments.slice(0, index + 1))
			.filter(cut => cut.length > 0)
			.map(cut => Path.posix.join(...cut))
			.filter(sub => sub !== '.')
			.map(sub => `/${sub}`)
			.forEach(sub => {
				if (!fs.existsSync(sub)) {
					fs.mkdirSync(sub);
				}
			});

		fs.writeFileSync(path, Buffer.from(content));
	});

	return fs;
};

export const dumpFileSystem = async (fs: typeof Fs): Promise<string> => {
	const target = tempy.directory();

	const files = await readdir('/', {
		deep: true,
		filter: stat => stat.isFile(),
		fs: {
			lstat: (fs.lstat || fs.stat).bind(fs),
			readdir: fs.readdir.bind(fs),
			stat: fs.stat.bind(fs)
		}
	});

	await Promise.all(
		files.map(async file => {
			const filePath = Path.join(target, file);
			const dirname = Path.dirname(filePath);

			if (!Fs.existsSync(dirname)) {
				FsExtra.mkdirpSync(dirname);
			}

			await FsExtra.writeFile(filePath, fs.readFileSync(`/${file}`));
		})
	);

	return target;
};
