import * as MobX from 'mobx';
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

	/**
	 * Adds a new pattern to this pattern folder. Note that you also have to add it to the styleguide (to have it in the global pattern registry).
	 * @param pattern The pattern to add.
	 */
	public addPattern(pattern: Pattern): void {
		this.patterns.set(pattern.getId(), pattern);
	}

	/**
	 * Writes information about this folder to the console (subfolders, patterns).
	 * @param indentation The current indentation level, if invoked from a parent pattern folder.
	 */
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
		let result: PatternFolder[] = [this];
		for (const child of this.children.values()) {
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
}
