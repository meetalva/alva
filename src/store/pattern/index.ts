import * as path from 'path';
import { PatternFolder } from './pattern_folder';
import { Store } from '..';

export class Pattern {
	public name: string;
	public folder: PatternFolder;
	public store: Store;

	public constructor(store: Store, folder: PatternFolder, name: string) {
		this.store = store;
		this.folder = folder;
		this.name = name;
	}

	public getPath(): string {
		return path.join(this.folder.getPath(), this.name);
	}
}
