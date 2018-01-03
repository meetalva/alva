import * as FileUtils from 'fs';
import * as MobX from 'mobx';
import * as PathUtils from 'path';
import { Pattern } from './pattern';
import { Store } from '../store';
import { TextPattern } from './text_pattern';

export class PatternFolder {
	@MobX.observable private children: Map<string, PatternFolder> = new Map();
	private name: string;
	private parent?: PatternFolder;
	@MobX.observable private patterns: Map<string, Pattern> = new Map();
	private store: Store;

	public constructor(store: Store, name: string, parent?: PatternFolder) {
		this.store = store;
		this.name = name;
		this.parent = parent;

		this.reload();
	}

	public addTextPattern(): void {
		const pattern: Pattern = new TextPattern(this);
		this.patterns.set(pattern.getId(), pattern);
	}

	public getAbsoluteSourcePath(): string {
		return PathUtils.join(this.store.getPatternsSourcePath(), this.getRelativePath());
	}

	public getAbsolutePath(): string {
		return PathUtils.join(this.store.getPatternsPath(), this.getRelativePath());
	}

	public getChild(path: string): PatternFolder | undefined {
		path = path.replace('/', PathUtils.sep);
		const slashPos: number = path.indexOf(PathUtils.sep);
		if (slashPos < 0) {
			return this.children.get(path);
		}

		const folderName: string = path.substring(0, slashPos);
		const folder: PatternFolder | undefined = this.children.get(folderName);
		if (!folder) {
			return undefined;
		}

		const remainingPath: string = path.substring(slashPos + PathUtils.sep.length);
		return folder.getChild(remainingPath);
	}

	public getChildren(): PatternFolder[] {
		return Array.from(this.children.values());
	}

	public getName(): string {
		return this.name;
	}

	public getParent(): PatternFolder | undefined {
		return this.parent;
	}

	public getPatterns(): Pattern[] {
		return Array.from(this.patterns.values());
	}

	public getPattern(path: string): Pattern | undefined {
		path = path.replace('/', PathUtils.sep);
		const slashPos: number = path.indexOf(PathUtils.sep);
		if (slashPos < 0) {
			return this.patterns.get(path);
		}

		const folderName: string = path.substring(0, slashPos);
		const folder: PatternFolder | undefined = this.children.get(folderName);
		if (!folder) {
			return undefined;
		}

		const remainingPath: string = path.substring(slashPos + PathUtils.sep.length);
		return folder.getPattern(remainingPath);
	}

	public getRelativePath(): string {
		if (this.parent) {
			return PathUtils.join(this.parent.getRelativePath(), this.name);
		} else {
			return '';
		}
	}

	public reload(): void {
		MobX.transaction(() => {
			this.patterns.clear();
			this.children.clear();

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
							this.patterns.set(childName, pattern);
						}
					} else {
						const childFolder: PatternFolder = new PatternFolder(this.store, childName, this);
						if (childFolder.patterns.size > 0 || childFolder.children.size > 0) {
							this.children.set(childName, childFolder);
						}
					}
				}
			});
		});
	}

	public searchPatterns(term: string): Pattern[] {
		let result: Pattern[] = [];
		this.patterns.forEach(pattern => {
			if (pattern.matches(term)) {
				result.push(pattern);
			}
		});

		this.children.forEach(child => {
			result = result.concat(child.searchPatterns(term));
		});

		return result;
	}
}
