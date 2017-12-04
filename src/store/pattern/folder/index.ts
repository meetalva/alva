import * as FileUtils from 'fs';
import * as PathUtils from 'path';
import { Pattern } from '..';
import { Store } from '../..';

export class PatternFolder {
	public children: PatternFolder[];
	public name: string;
	public parent?: PatternFolder;
	public patterns: Pattern[];
	public store: Store;

	public constructor(store: Store, name: string, parent?: PatternFolder) {
		this.store = store;
		this.name = name;
		this.parent = parent;

		this.refresh();
	}

	public getPath(): string {
		if (this.parent) {
			return PathUtils.join(this.parent.getPath(), this.name);
		} else {
			return PathUtils.join(this.store.styleGuidePath, 'lib', this.name);
		}
	}

	public getStyleguideRelativePath(): string {
		if (this.parent) {
			return PathUtils.join(this.parent.getPath(), this.name);
		} else {
			return this.name;
		}
	}

	public refresh(): void {
		this.patterns = [];
		this.children = [];

		const parentPath: string = this.getPath();
		FileUtils.readdirSync(parentPath).forEach(childName => {
			const childPath = PathUtils.join(parentPath, childName);
			if (FileUtils.lstatSync(childPath).isDirectory()) {
				if (
					FileUtils.existsSync(PathUtils.join(childPath, 'index.d.ts')) &&
					FileUtils.existsSync(PathUtils.join(childPath, 'index.js'))
				) {
					const pattern: Pattern = new Pattern(this.store, this, childName);
					if (pattern.valid) {
						this.patterns.push(pattern);
					}
				} else {
					const childFolder: PatternFolder = new PatternFolder(this.store, childName, this);
					if (childFolder.patterns.length || childFolder.children.length) {
						this.children.push(childFolder);
					}
				}
			}
		});
	}
}
