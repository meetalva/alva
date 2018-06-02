import * as Mobx from 'mobx';
import { Pattern } from './pattern';
import { PatternLibrary } from './pattern-library';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface PatternFolderInit {
	id?: string;
	name: string;
	parent?: PatternFolder;
	patterns?: string[];
	type: Types.PatternFolderType;
}

export interface PatternFolderContext {
	patternLibrary: PatternLibrary;
}

export class PatternFolder {
	@Mobx.observable private children: PatternFolder[] = [];

	@Mobx.observable private id: string;

	@Mobx.observable private name: string;

	@Mobx.observable private parent?: PatternFolder;

	private readonly patternLibrary: PatternLibrary;

	@Mobx.observable private patterns: string[] = [];

	private readonly type: Types.PatternFolderType;

	public constructor(init: PatternFolderInit, context: PatternFolderContext) {
		this.id = init.id || uuid.v4();
		this.name = init.name;
		this.parent = init.parent;
		this.patternLibrary = context.patternLibrary;
		this.type = init.type;

		if (init.patterns) {
			this.patterns = init.patterns;
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
				patterns: serialized.patterns,
				type:
					serialized.type === 'builtin'
						? Types.PatternFolderType.Builtin
						: Types.PatternFolderType.UserProvided
			},
			context
		);

		serialized.children.forEach(child => {
			folder.addChild(PatternFolder.from(child, context));
		});

		return folder;
	}

	@Mobx.action
	public addChild(child: PatternFolder): void {
		this.children.push(child);
		child.setParent(this);
	}

	@Mobx.action
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

	public getType(): Types.PatternFolderType {
		return this.type;
	}

	@Mobx.action
	public remove(): void {
		if (this.parent) {
			this.parent.removeChild(this);
			this.parent = undefined;
		}
	}

	@Mobx.action
	public removeChild(child: PatternFolder): void {
		const index = this.children.indexOf(child);
		if (index > -1) {
			this.children.splice(index, 1);
		}
	}

	@Mobx.action
	public setParent(parent: PatternFolder): void {
		this.parent = parent;
	}

	public toJSON(): Types.SerializedPatternFolder {
		return {
			id: this.id,
			name: this.name,
			children: this.children.map(child => child.toJSON()),
			patterns: Array.from(this.patterns),
			type: this.type
		};
	}
}
