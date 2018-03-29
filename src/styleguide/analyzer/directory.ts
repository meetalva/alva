import * as FileUtils from 'fs';
import * as PathUtils from 'path';

export class Directory {
	private readonly path: string;

	public constructor(path: string) {
		this.path = path;
	}

	public *getDirectories(): IterableIterator<Directory> {
		for (const childName of FileUtils.readdirSync(this.path)) {
			const childPath = PathUtils.join(this.path, childName);

			if (FileUtils.lstatSync(childPath).isDirectory()) {
				yield new Directory(childPath);
			}
		}
	}

	public *getFiles(): IterableIterator<string> {
		for (const childName of FileUtils.readdirSync(this.path)) {
			const childPath = PathUtils.join(this.path, childName);

			if (FileUtils.lstatSync(childPath).isFile()) {
				yield childPath;
			}
		}
	}

	public getName(): string {
		return PathUtils.basename(this.path);
	}

	public getPath(): string {
		return this.path;
	}
}
