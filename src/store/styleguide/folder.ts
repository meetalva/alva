import * as MobX from 'mobx';
import * as PathUtils from 'path';
import { Pattern } from './pattern';

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
	 * The patterns directly contained by this folder.
	 */
	@MobX.observable private patterns: Map<string, Pattern> = new Map();

	public constructor(name: string, parent?: PatternFolder) {
		this.name = name;
		this.parent = parent;
		if (parent) {
			parent.children.set(name, this);
		}
	}

	public addPattern(pattern: Pattern): void {
		this.patterns.set(pattern.getId(), pattern);
	}

	public dump(indentation: number = 0): void {
		console.log(`${'  '.repeat(indentation)}Folder '${this.name}'`);
		for (const child of this.children.values()) {
			child.dump(indentation + 1);
		}
		for (const pattern of this.patterns.values()) {
			pattern.dump(indentation + 1);
		}
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
	 * Returns the child folders of this folder.
	 * @return The child folders of this folder.
	 */
	public getDescendants(): PatternFolder[] {
		let result: PatternFolder[] = [];
		for (const child of this.children.values()) {
			result.push(child);
			result = result.concat(child.getDescendants());
		}

		return result;
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
	 * Returns the patterns directly contained by this folder.
	 * @return The patterns directly contained by this folder.
	 */
	public getPatterns(): Pattern[] {
		return Array.from(this.patterns.values());
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
}
