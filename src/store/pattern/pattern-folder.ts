import { Pattern } from './pattern';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface PatternFolderInit {
	id?: string;
	name: string;
	parent?: PatternFolder;
	patterns?: string[];
}

/**
 * A folder within the styleguide containing patterns.
 * This usually is a physical folder inside the styleguide (as it is with Patternplate), but
 * it may also reflect a virtual pattern grouping, as parsed by the store and/or pattern parsers.
 */
export class PatternFolder {
	private children: PatternFolder[] = [];

	private id: string;

	private name: string;

	private parent?: PatternFolder;

	private patterns: string[] = [];

	public constructor(init: PatternFolderInit) {
		this.id = init.id || uuid.v4();
		this.name = init.name;
		this.parent = init.parent;

		if (init.patterns) {
			this.patterns = init.patterns;
		}

		if (init.parent) {
			init.parent.children.push(this);
		}
	}

	public static from(serialized: Types.SerializedPatternFolder): PatternFolder {
		const folder = new PatternFolder({
			id: serialized.id,
			name: serialized.name,
			patterns: serialized.patterns
		});

		serialized.children.forEach(child => {
			folder.addChild(PatternFolder.from(child));
		});

		return folder;
	}

	public addChild(child: PatternFolder): void {
		this.children.push(child);
		child.setParent(this);
	}

	/**
	 * Adds a new pattern to this pattern folder. Note that you also have to add it to the styleguide (to have it in the global pattern registry).
	 * @param pattern The pattern to add.
	 */
	public addPattern(pattern: Pattern): void {
		this.patterns.push(pattern.getId());
	}

	/**
	 * Returns the child folders of this folder.
	 * @return The child folders of this folder.
	 */
	public getChildren(): PatternFolder[] {
		return this.children;
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

	public getId(): string {
		return this.id;
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
	public getPatterns(): string[] {
		return this.patterns;
	}

	public setParent(parent: PatternFolder): void {
		this.parent = parent;
	}

	public toJSON(): Types.SerializedPatternFolder {
		return {
			id: this.id,
			name: this.name,
			children: this.children.map(child => child.toJSON()),
			patterns: this.patterns
		};
	}
}
