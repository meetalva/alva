import * as FileUtils from 'fs';
import * as PathUtils from 'path';
import { Pattern } from '..';
import { Store } from '../..';

export class PatternFolder {
	private children: PatternFolder[];
	private childrenByName: { [name: string]: PatternFolder } = {};
	private name: string;
	private parent?: PatternFolder;
	private patterns: Pattern[];
	private patternsByName: { [id: string]: Pattern } = {};
	private store: Store;

	public constructor(store: Store, name: string, parent?: PatternFolder) {
		this.store = store;
		this.name = name;
		this.parent = parent;

		this.reload();
	}

	public getAbsolutePath(): string {
		return PathUtils.join(this.store.getPatternsPath(), this.getRelativePath());
	}

	public getChild(path: string): PatternFolder | undefined {
		const slashPos: number = path.indexOf('/');
		if (slashPos < 0) {
			return this.childrenByName[path];
		}

		const folderName: string = path.substring(0, slashPos);
		const folder: PatternFolder | undefined = this.childrenByName[folderName];
		if (!folder) {
			return undefined;
		}

		const remainingPath: string = path.substring(slashPos + 1);
		return folder.getChild(remainingPath);
	}

	public getChildren(): PatternFolder[] {
		return this.children;
	}

	public getName(): string {
		return this.name;
	}

	public getParent(): PatternFolder | undefined {
		return this.parent;
	}

	public getPatterns(): Pattern[] {
		return this.patterns;
	}

	public getPattern(path: string): Pattern | undefined {
		const slashPos: number = path.indexOf('/');
		if (slashPos < 0) {
			return this.patternsByName[path];
		}

		const folderName: string = path.substring(0, slashPos);
		const folder: PatternFolder | undefined = this.childrenByName[folderName];
		if (!folder) {
			return undefined;
		}

		const remainingPath: string = path.substring(slashPos + 1);
		return folder.getPattern(remainingPath);
	}

	public getRelativePath(): string {
		if (this.parent) {
			return PathUtils.join(this.parent.getRelativePath(), this.name);
		} else {
			return this.name;
		}
	}

	public reload(): void {
		this.patterns = [];
		this.children = [];

		const parentPath: string = this.getAbsolutePath();
		FileUtils.readdirSync(parentPath).forEach(childName => {
			const childPath = PathUtils.join(parentPath, childName);
			if (FileUtils.lstatSync(childPath).isDirectory()) {
				if (
					FileUtils.existsSync(PathUtils.join(childPath, 'index.d.ts')) &&
					FileUtils.existsSync(PathUtils.join(childPath, 'index.js'))
				) {
					const pattern: Pattern = new Pattern(this, childName);
					if (pattern.isValid()) {
						this.patterns.push(pattern);
						this.patternsByName[childName] = pattern;
					}
				} else {
					const childFolder: PatternFolder = new PatternFolder(this.store, childName, this);
					if (childFolder.patterns.length || childFolder.children.length) {
						this.children.push(childFolder);
						this.childrenByName[childName] = childFolder;
					}
				}
			}
		});
	}
}
