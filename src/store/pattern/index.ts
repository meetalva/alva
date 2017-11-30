import * as path from 'path';
import PatternFolder from './pattern_folder';
import Store from '..';

export default class Pattern {
	name: string;
	folder: PatternFolder;
	store: Store;

	constructor(store: Store, folder: PatternFolder, name: string) {
		this.store = store;
		this.folder = folder;
		this.name = name;
	}

	getPath(): string {
		return path.join(this.folder.getPath(), this.name);
	}
}
