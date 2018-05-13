import { Box, Page, Placeholder, Text } from './builtins';
import { Pattern, PatternFolder, SyntheticPatternType } from '../pattern';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface PatternLibraryInit {
	id?: string;
	patterns?: Pattern[];
	root?: PatternFolder;
}

export class PatternLibrary {
	private id: string;
	private patterns: Pattern[] = [];
	private root: PatternFolder;

	public constructor(init: PatternLibraryInit) {
		this.id = init.id || uuid.v4();
		this.root = init.root || new PatternFolder({ name: 'root' });

		if (init.patterns) {
			this.patterns = init.patterns;
		} else {
			const syntheticFolder = new PatternFolder({
				name: 'Synthetic',
				parent: this.root
			});

			const placeholder = Placeholder();
			const text = Text();
			const box = Box();

			this.patterns = [Page(), text, box, placeholder];

			syntheticFolder.addPattern(text);
			syntheticFolder.addPattern(box);
			syntheticFolder.addPattern(placeholder);
		}
	}

	public static create(): PatternLibrary {
		return new PatternLibrary({});
	}

	public static from(serializedStyleguide: Types.SerializedStyleguide): PatternLibrary {
		return new PatternLibrary({
			id: serializedStyleguide.id,
			patterns: serializedStyleguide.patterns.map(pattern => Pattern.from(pattern)),
			root: PatternFolder.from(serializedStyleguide.root)
		});
	}

	public addPattern(pattern: Pattern): void {
		this.patterns.push(pattern);
	}

	public getPatternById(id: string): Pattern | undefined {
		return this.patterns.find(pattern => pattern.getId() === id);
	}

	public getPatternByType(type: SyntheticPatternType): Pattern {
		return this.patterns.find(pattern => pattern.getType() === type) as Pattern;
	}

	public getPatterns(): Pattern[] {
		return this.patterns;
	}

	public getRoot(): PatternFolder {
		return this.root;
	}

	public toJSON(): Types.SerializedStyleguide {
		return {
			id: this.id,
			patterns: this.patterns.map(p => p.toJSON()),
			root: this.root.toJSON()
		};
	}
}
