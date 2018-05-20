import { Box, Page, Placeholder, Text } from './builtins';
import * as Fuse from 'fuse.js';
import * as Mobx from 'mobx';
import { Pattern, PatternFolder, PatternSlot, SyntheticPatternType } from '../pattern';
import { AnyPatternProperty, PatternProperty } from '../pattern-property';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface PatternLibraryInit {
	bundle: string;
	id: string;
	patternProperties: AnyPatternProperty[];
	patterns: Pattern[];
	root?: PatternFolder;
	state: Types.PatternLibraryState;
}

export class PatternLibrary {
	private bundle: string;
	private fuse: Fuse;
	private id: string;
	private patternProperties: AnyPatternProperty[] = [];
	private patterns: Pattern[] = [];
	private root: PatternFolder;
	@Mobx.observable private state: Types.PatternLibraryState;

	public constructor(init: PatternLibraryInit) {
		this.bundle = init.bundle;
		this.id = init.id || uuid.v4();
		this.patterns = init.patterns;
		this.patternProperties = init.patternProperties;
		this.state = init.state;

		if (init.root) {
			this.root = init.root;
			this.updateSearch();
		}
	}

	public static create(): PatternLibrary {
		const patternLibrary = new PatternLibrary({
			bundle: '',
			id: uuid.v4(),
			patterns: [],
			patternProperties: [],
			state: Types.PatternLibraryState.Pristine
		});

		const root = new PatternFolder({ name: 'root' }, { patternLibrary });
		patternLibrary.setRootFolder(root);

		const syntheticFolder = new PatternFolder(
			{
				name: 'Synthetic',
				parent: root
			},
			{ patternLibrary }
		);

		const { pagePattern, pageProperties } = Page({ patternLibrary });
		const { placeholderPattern, placeholderProperties } = Placeholder({ patternLibrary });
		const { textPattern, textProperties } = Text({ patternLibrary });
		const { boxPattern, boxProperties } = Box({ patternLibrary });

		syntheticFolder.addPattern(textPattern);
		syntheticFolder.addPattern(boxPattern);
		syntheticFolder.addPattern(placeholderPattern);

		[pagePattern, textPattern, boxPattern, placeholderPattern].forEach(pattern => {
			patternLibrary.addPattern(pattern);
		});

		[...pageProperties, ...placeholderProperties, ...textProperties, ...boxProperties].forEach(
			property => {
				patternLibrary.addProperty(property);
			}
		);

		return patternLibrary;
	}

	public static from(serialized: Types.SerializedPatternLibrary): PatternLibrary {
		const patternLibrary = new PatternLibrary({
			bundle: serialized.bundle,
			id: serialized.id,
			patterns: [],
			patternProperties: serialized.patternProperties.map(p => PatternProperty.from(p)),
			state:
				serialized.state === 'pristine'
					? Types.PatternLibraryState.Pristine
					: Types.PatternLibraryState.Imported
		});

		patternLibrary.setRootFolder(PatternFolder.from(serialized.root, { patternLibrary }));

		serialized.patterns.forEach(pattern => {
			patternLibrary.addPattern(Pattern.from(pattern, { patternLibrary }));
		});

		return patternLibrary;
	}

	public addPattern(pattern: Pattern): void {
		this.patterns.push(pattern);
		this.updateSearch();
	}

	public addProperty(property: AnyPatternProperty): void {
		this.patternProperties.push(property);
	}

	public getBundle(): string {
		return this.bundle;
	}

	public getPatternById(id: string): Pattern | undefined {
		return this.patterns.find(pattern => pattern.getId() === id);
	}

	public getPatternByType(type: SyntheticPatternType): Pattern {
		return this.patterns.find(pattern => pattern.getType() === type) as Pattern;
	}

	public getPatternProperties(): AnyPatternProperty[] {
		return this.patternProperties;
	}

	public getPatternPropertyById(id: string): AnyPatternProperty | undefined {
		return this.patternProperties.find(patternProperty => patternProperty.getId() === id);
	}

	public getPatterns(): Pattern[] {
		return this.patterns;
	}

	public getRoot(): PatternFolder {
		return this.root;
	}

	public getSlots(): PatternSlot[] {
		return this.patterns.reduce((acc, pattern) => [...acc, ...pattern.getSlots()], []);
	}

	public getState(): Types.PatternLibraryState {
		return this.state;
	}

	public query(term: string): string[] {
		if (term.trim().length === 0) {
			return this.root.getDescendants().map(item => item.getId());
		}

		return this.fuse
			.search<Types.SerializedPattern | Types.SerializedPatternFolder>(term)
			.map(match => match.id);
	}

	public setBundle(bundle: string): void {
		this.bundle = bundle;
	}

	public setRootFolder(root: PatternFolder): void {
		this.root = root;
	}

	public setState(state: Types.PatternLibraryState): void {
		this.state = state;
	}

	public toJSON(): Types.SerializedPatternLibrary {
		return {
			bundle: this.bundle,
			id: this.id,
			patterns: this.patterns.map(p => p.toJSON()),
			patternProperties: this.patternProperties.map(p => p.toJSON()),
			root: this.root.toJSON(),
			state: this.state
		};
	}

	public updateSearch(): void {
		const registry = this.root.getDescendants().map(item => item.toJSON());

		this.fuse = new Fuse(registry, {
			keys: ['name']
		});
	}
}
