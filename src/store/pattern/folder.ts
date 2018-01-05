import * as FileUtils from 'fs';
import * as MobX from 'mobx';
import * as PathUtils from 'path';
import { Pattern } from './pattern';
import { Store } from '../store';
import { TextPattern } from './text_pattern';

/**
 * A folder within the styleguide containing patterns.
 * This usually is a physical folder inside the styleguide (as it is with Patternplate), but
 * it may also reflect a virtual pattern grouping, as parsed by the store and/or pattern parsers.
 */
export class PatternFolder {
	/**
	 * The child folders of this folder.
	 */
	@MobX.observable private children: Map<string, PatternFolder> = new Map();

	/**
	 * The name (and ID) of the folder, unique within its parent.
	 * This usually is the file name of the physical pattern folder.
	 */
	private name: string;

	/**
	 * The parent folder, if this is not the root folder.
	 */
	private parent?: PatternFolder;

	/**
	 * The (valid) patterns directly contained by this folder.
	 */
	@MobX.observable private patterns: Map<string, Pattern> = new Map();

	/**
	 * The store this folder was initialized with (for later path lookups).
	 */
	private store: Store;

	public constructor(store: Store, name: string, parent?: PatternFolder) {
		this.store = store;
		this.name = name;
		this.parent = parent;

		this.reload();
	}

	/**
	 * Creates and adds a pseudo text-pattern to this folder.
	 * @see TextPattern
	 */
	public addTextPattern(): void {
		const pattern: Pattern = new TextPattern(this);
		this.patterns.set(pattern.getId(), pattern);
	}

	/**
	 * Returns the absolute and OS-dependent path of the sources of this pattern folder.
	 * @return The absolute pattern folder source path.
	 */
	public getAbsoluteSourcePath(): string {
		return PathUtils.join(this.store.getPatternsSourcePath(), this.getRelativePath());
	}

	/**
	 * Returns the absolute and OS-dependent path of the built files of this pattern folder.
	 * @return The absolute pattern folder path.
	 */
	public getAbsolutePath(): string {
		return PathUtils.join(this.store.getPatternsPath(), this.getRelativePath());
	}

	/**
	 * Returns the child folder matching a name or path, relative to this folder.
	 * @param path The name of the child inside this folder, or a path (separated by forward slash
	 * or OS-specific separator), where each element is a folder name.
	 * @return The child folder if such name or path resolves to one.
	 */
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

	/**
	 * Returns the child folders of this folder.
	 * @return The child folders of this folder.
	 */
	public getChildren(): PatternFolder[] {
		return Array.from(this.children.values());
	}

	/**
	 * Returns the name (and ID) of the folder, unique within its parent.
	 * This usually is the file name of the physical pattern folder.
	 * @return The name (and ID) of the folder.
	 */
	public getName(): string {
		return this.name;
	}

	/**
	 * Returns the parent folder, if this is not the root folder.
	 * @return The parent folder, if this is not the root folder.
	 */
	public getParent(): PatternFolder | undefined {
		return this.parent;
	}

	/**
	 * Returns the (valid) patterns directly contained by this folder.
	 * @return The (valid) patterns directly contained by this folder.
	 */
	public getPatterns(): Pattern[] {
		return Array.from(this.patterns.values());
	}

	/**
	 * Returns the pattern matching a name or path, relative to this folder.
	 * @param path The name of the pattern inside this folder, or a path (separated by forward slash
	 * or OS-specific separator), where each element is a folder name, and the last is the pattern
	 * name inside that last folder.
	 * @return The pattern if such name or path resolves to one.
	 */
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

	/**
	 * Returns the OS-dependent path of the files of this pattern folder relative to their
	 * styleguide patterns root.
	 * @return The relative pattern folder path.
	 */
	public getRelativePath(): string {
		if (this.parent) {
			return PathUtils.join(this.parent.getRelativePath(), this.name);
		} else {
			return '';
		}
	}

	/**
	 * Loads (or reload) all child folders and patterns starting with this pattern folder.
	 * Also delegates to all registered pattern parsers to read all meta-information
	 * provided, parsing name, ID, properties, etc. of the patterns.
	 * All parsers may contribute to the final patterns information.
	 */
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

	/**
	 * Returns all pattern of this folder and its sub-folders matching a given search string.
	 * @param term The search string as provided by the user.
	 * @return The list of matching patterns.
	 */
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
