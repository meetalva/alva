import { Pattern } from './pattern';
import { PatternLibrary } from '../pattern-library';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface PatternFolderInit {
	id?: string;
	name: string;
	parent?: PatternFolder;
	patterns?: string[];
}

export interface PatternFolderContext {
	patternLibrary: PatternLibrary;
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

	private patternLibrary: PatternLibrary;

	private patterns: string[] = [];

	public constructor(init: PatternFolderInit, context: PatternFolderContext) {
		this.id = init.id || uuid.v4();
		this.name = init.name;
		this.parent = init.parent;
		this.patternLibrary = context.patternLibrary;

		if (init.patterns) {
			this.patterns = init.patterns;
		}

		if (init.parent) {
			init.parent.addChild(this);
		}
	}

	public static from(
		serialized: Types.SerializedPatternFolder,
		context: PatternFolderContext
	): PatternFolder {
		const folder = new PatternFolder(
			{
				id: serialized.id,
				name: serialized.name,
				patterns: serialized.patterns
			},
			context
		);

		serialized.children.forEach(child => {
			folder.addChild(PatternFolder.from(child, context));
		});

		return folder;
	}

	public addChild(child: PatternFolder): void {
		this.children.push(child);
		child.setParent(this);
	}

	public addPattern(pattern: Pattern): void {
		this.patterns.push(pattern.getId());
	}

	public getChildren(): PatternFolder[] {
		return this.children;
	}

	public getDescendants(): (PatternFolder | Pattern)[] {
		return this.getChildren().reduce(
			(acc, child) => [...acc, child, ...child.getDescendants()],
			this.getPatterns()
		);
	}

	public getId(): string {
		return this.id;
	}

	public getName(): string {
		return this.name;
	}

	public getParent(): PatternFolder | undefined {
		return this.parent;
	}

	public getPatternIds(): string[] {
		return this.patterns;
	}

	public getPatterns(): Pattern[] {
		const isPattern = (p): p is Pattern => typeof p !== 'undefined';

		return this.getPatternIds()
			.map(id => this.patternLibrary.getPatternById(id))
			.filter(isPattern);
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
