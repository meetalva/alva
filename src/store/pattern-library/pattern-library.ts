import { Box, Page, Placeholder, Text } from './builtins';
import * as Fuse from 'fuse.js';
import { Pattern, PatternFolder, SyntheticPatternType } from '../pattern';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface PatternLibraryInit {
	id?: string;
	patterns?: Pattern[];
	root?: PatternFolder;
}

export class PatternLibrary {
	private fuse: Fuse;
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

		this.updateSearch();
	}

	public static create(): PatternLibrary {
		return new PatternLibrary({});
	}

	public static from(serializedStyleguide: Types.SerializedPatternLibrary): PatternLibrary {
		return new PatternLibrary({
			id: serializedStyleguide.id,
			patterns: serializedStyleguide.patterns.map(pattern => Pattern.from(pattern)),
			root: PatternFolder.from(serializedStyleguide.root)
		});
	}

	public addPattern(pattern: Pattern): void {
		this.patterns.push(pattern);
		this.updateSearch();
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

	public query(term: string): string[] {
		if (term.trim().length === 0) {
			return this.root.getDescendants().map(item => item.getId());
		}

		return this.fuse
			.search<Types.SerializedPattern | Types.SerializedPatternFolder>(term)
			.map(match => match.id);
	}

	public toJSON(): Types.SerializedPatternLibrary {
		return {
			id: this.id,
			patterns: this.patterns.map(p => p.toJSON()),
			root: this.root.toJSON()
		};
	}

	public updateSearch(): void {
		const registry = this.root.getDescendants().map(item => item.toJSON());

		this.fuse = new Fuse(registry, {
			keys: ['name']
		});
	}
}
