import * as Fs from 'fs';
import * as Path from 'path';

export class Directory {
	private readonly path: string;

	public constructor(path: string) {
		this.path = path;
	}

	public *getDirectories(): IterableIterator<Directory> {
		for (const childName of Fs.readdirSync(this.path)) {
			const childPath = Path.join(this.path, childName);

			if (Fs.lstatSync(childPath).isDirectory()) {
				yield new Directory(childPath);
			}
		}
	}

	public *getFiles(): IterableIterator<string> {
		for (const childName of Fs.readdirSync(this.path)) {
			const childPath = Path.join(this.path, childName);

			if (Fs.lstatSync(childPath).isFile()) {
				yield childPath;
			}
		}
	}

	public getName(): string {
		return Path.basename(this.path);
	}

	public getPath(): string {
		return this.path;
	}
}
