import { Box, Image, Link, Page, Text } from './builtins';
import * as Fuse from 'fuse.js';
import { isEqual } from 'lodash';
import * as Mobx from 'mobx';
import { Pattern, PatternSlot } from '../pattern';
import { PatternFolder } from '../pattern-folder';
import { AnyPatternProperty, PatternEnumProperty, PatternProperty } from '../pattern-property';
import * as Types from '../../types';
import * as uuid from 'uuid';

export interface PatternLibraryInit {
	bundle: string;
	id: string;
	patternProperties: AnyPatternProperty[];
	patterns: Pattern[];
	root?: PatternFolder;
	state: Types.PatternLibraryState;
}

export interface BuiltInContext {
	options: PatternLibraryCreateOptions;
	patternLibrary: PatternLibrary;
}

export interface BuiltInResult {
	pattern: Pattern;
	properties: AnyPatternProperty[];
}

export interface PatternLibraryCreateOptions {
	getGloablEnumOptionId(enumId: string, contextId: string): string;
	getGlobalPatternId(contextId: string): string;
	getGlobalPropertyId(patternId: string, contextId: string): string;
	getGlobalSlotId(patternId: string, contextId: string): string;
}

export class PatternLibrary {
	@Mobx.observable private bundle: string;
	@Mobx.observable private fuse: Fuse;
	@Mobx.observable private id: string;
	@Mobx.observable private patternProperties: AnyPatternProperty[] = [];
	@Mobx.observable private patterns: Pattern[] = [];
	@Mobx.observable private root: PatternFolder;
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

	public static create(options: PatternLibraryCreateOptions): PatternLibrary {
		const patternLibrary = new PatternLibrary({
			bundle: '',
			id: uuid.v4(),
			patterns: [],
			patternProperties: [],
			state: Types.PatternLibraryState.Pristine
		});

		const root = new PatternFolder(
			{
				name: 'root',
				type: Types.PatternFolderType.Builtin
			},
			{ patternLibrary }
		);

		patternLibrary.setRootFolder(root);

		const syntheticFolder = new PatternFolder(
			{
				name: 'Built-In Components',
				type: Types.PatternFolderType.Builtin
			},
			{ patternLibrary }
		);

		root.addChild(syntheticFolder);

		const link = Link({ patternLibrary, options });
		const page = Page({ patternLibrary, options });
		const image = Image({ patternLibrary, options });
		const text = Text({ patternLibrary, options });
		const box = Box({ patternLibrary, options });

		syntheticFolder.addPattern(text.pattern);
		syntheticFolder.addPattern(box.pattern);
		syntheticFolder.addPattern(image.pattern);
		syntheticFolder.addPattern(link.pattern);

		[page.pattern, text.pattern, box.pattern, image.pattern, link.pattern].forEach(pattern => {
			patternLibrary.addPattern(pattern);
		});

		[
			...page.properties,
			...image.properties,
			...text.properties,
			...box.properties,
			...link.properties
		].forEach(property => {
			patternLibrary.addProperty(property);
		});

		return patternLibrary;
	}

	public static from(serialized: Types.SerializedPatternLibrary): PatternLibrary {
		const state = deserializeState(serialized.state);

		const patternLibrary = new PatternLibrary({
			bundle: serialized.bundle,
			id: serialized.id,
			patterns: [],
			patternProperties: serialized.patternProperties.map(p => PatternProperty.from(p)),
			state
		});

		patternLibrary.setRootFolder(PatternFolder.from(serialized.root, { patternLibrary }));

		serialized.patterns.forEach(pattern => {
			patternLibrary.addPattern(Pattern.from(pattern, { patternLibrary }));
		});

		return patternLibrary;
	}

	public static import(
		analysis: Types.LibraryAnalysis,
		previousLibrary?: PatternLibrary
	): PatternLibrary {
		const patternLibrary = PatternLibrary.create({
			getGloablEnumOptionId: (enumId, contextId) =>
				previousLibrary ? previousLibrary.assignEnumOptionId(enumId, contextId) : uuid.v4(),
			getGlobalPatternId: contextId =>
				previousLibrary ? previousLibrary.assignPatternId(contextId) : uuid.v4(),
			getGlobalPropertyId: (patternId, contextId) =>
				previousLibrary ? previousLibrary.assignPropertyId(patternId, contextId) : uuid.v4(),
			getGlobalSlotId: (patternId, contextId) =>
				previousLibrary ? previousLibrary.assignSlotId(patternId, contextId) : uuid.v4()
		});

		const folder = new PatternFolder(
			{ name: analysis.name, type: Types.PatternFolderType.UserProvided },
			{ patternLibrary }
		);

		analysis.patterns
			.map(item => Pattern.from(item.pattern, { patternLibrary }))
			.forEach(pattern => {
				patternLibrary.addPattern(pattern);
				folder.addPattern(pattern);
			});

		analysis.patterns.forEach(item => {
			item.properties
				.map(property => PatternProperty.from(property))
				.forEach(property => patternLibrary.addProperty(property));
		});

		patternLibrary.getRoot().addChild(folder);
		patternLibrary.setState(Types.PatternLibraryState.Connected);
		patternLibrary.setBundle(analysis.bundle);

		patternLibrary.updateSearch();

		return patternLibrary;
	}

	public static isEqual(a: PatternLibrary, b: PatternLibrary): boolean {
		return isEqual(a.toJSON(), b.toJSON());
	}

	public addPattern(pattern: Pattern): void {
		this.patterns.push(pattern);
		this.updateSearch();
	}

	public addProperty(property: AnyPatternProperty): void {
		this.patternProperties.push(property);
	}

	public assignEnumOptionId(enumId: string, contextId: string): string {
		const enumProperty = this.getPatternPropertyById(enumId) as PatternEnumProperty;

		if (!enumProperty) {
			return uuid.v4();
		}

		const option = enumProperty.getOptionByContextId(contextId);
		return option ? option.getId() : uuid.v4();
	}

	public assignPatternId(contextId: string): string {
		const pattern = this.getPatternByContextId(contextId);
		return pattern ? pattern.getId() : uuid.v4();
	}

	public assignPropertyId(patternId: string, contextId: string): string {
		const pattern = this.getPatternById(patternId);
		if (!pattern) {
			return uuid.v4();
		}
		const property = pattern.getPropertyByContextId(contextId);
		return property ? property.getId() : uuid.v4();
	}

	public assignSlotId(patternId: string, contextId: string): string {
		const pattern = this.getPatternById(patternId);
		if (!pattern) {
			return uuid.v4();
		}
		const slot = pattern.getSlots().find(s => s.getContextId() === contextId);
		return slot ? slot.getId() : uuid.v4();
	}

	public getBundle(): string {
		return this.bundle;
	}

	public getId(): string {
		return this.id;
	}

	public getPatternByContextId(contextId: string): Pattern | undefined {
		return this.patterns.find(pattern => pattern.getContextId() === contextId);
	}

	public getPatternById(id: string): Pattern | undefined {
		return this.patterns.find(pattern => pattern.getId() === id);
	}

	public getPatternByType(type: Types.PatternType): Pattern {
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

	@Mobx.action
	public removePattern(pattern: Pattern): void {
		const index = this.patterns.indexOf(pattern);

		if (index === -1) {
			return;
		}

		this.patterns.splice(index, 1);
	}

	@Mobx.action
	public removeProperty(property: AnyPatternProperty): void {
		const index = this.patternProperties.indexOf(property);

		if (index === -1) {
			return;
		}

		this.patternProperties.splice(index, 1);
	}

	@Mobx.action
	public setBundle(bundle: string): void {
		this.bundle = bundle;
	}

	@Mobx.action
	public setRootFolder(root: PatternFolder): void {
		this.root = root;
	}

	@Mobx.action
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

	@Mobx.action
	public updateSearch(): void {
		const registry = this.root.getDescendants().map(item => item.toJSON());

		this.fuse = new Fuse(registry, {
			keys: ['name']
		});
	}
}

function deserializeState(
	input: 'pristine' | 'connected' | 'disconnected'
): Types.PatternLibraryState {
	switch (input) {
		case 'pristine':
			return Types.PatternLibraryState.Pristine;
		case 'connected':
			return Types.PatternLibraryState.Connected;
		case 'disconnected':
			return Types.PatternLibraryState.Disconnected;
	}
}
