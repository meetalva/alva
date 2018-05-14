import * as Fs from 'fs';
import * as Path from 'path';

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
