import { computeDifference } from '../../alva-util';
import { isEqual } from 'lodash';
import * as Mobx from 'mobx';
import { Pattern, PatternSlot } from '../pattern';
import { ElementContent } from '../element';
import { AnyPatternProperty, PatternEnumProperty, PatternProperty } from '../pattern-property';
import { Project } from '../project';
import * as Types from '../../types';
import * as uuid from 'uuid';

const md5 = require('md5');

export interface PatternLibraryInit {
	bundleId: string;
	bundle: string;
	color: string;
	description: string;
	id: string;
	image: string;
	name: string;
	version: string;
	origin: Types.PatternLibraryOrigin;
	installType: Types.PatternLibraryInstallType;
	patternProperties: AnyPatternProperty[];
	packageFile: { [key: string]: unknown };
	patterns: Pattern[];
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
	getGlobalEnumOptionId(enumId: string, contextId: string): string;
	getGlobalPatternId(contextId: string): string;
	getGlobalPropertyId(patternId: string, contextId: string): string;
	getGlobalSlotId(patternId: string, contextId: string): string;
}

export class PatternLibrary {
	public readonly model = Types.ModelName.PatternLibrary;
	private readonly id: string;

	@Mobx.observable private bundleId: string;
	@Mobx.observable private bundle: string;
	@Mobx.observable private color: string;
	@Mobx.observable private description: string;
	@Mobx.observable private name: string;
	@Mobx.observable private image: string;
	@Mobx.observable private version: string;
	@Mobx.observable private patternProperties: Map<string, AnyPatternProperty> = new Map();
	@Mobx.observable private patterns: Map<string, Pattern> = new Map();
	@Mobx.observable private origin: Types.PatternLibraryOrigin;
	@Mobx.observable private installType: Types.PatternLibraryInstallType;
	@Mobx.observable private state: Types.PatternLibraryState;
	@Mobx.observable private packageFile: { [key: string]: unknown };

	@Mobx.computed
	private get slots(): PatternSlot[] {
		return this.getPatterns().reduce<PatternSlot[]>(
			(acc, pattern) => [...acc, ...pattern.getSlots()],
			[]
		);
	}

	@Mobx.computed
	public get contextId(): string {
		return [this.name, this.version || '1.0.0'].join('@');
	}

	public constructor(init: PatternLibraryInit) {
		this.bundleId = init.bundleId;
		this.bundle = init.bundle;
		this.color = init.color;
		this.description = init.description;
		this.id = init.id || uuid.v4();
		this.name = init.name;
		this.image = init.image;
		this.version = init.version;
		this.origin = init.origin;
		this.installType = init.installType;
		this.packageFile = init.packageFile;
		init.patterns.forEach(pattern => this.patterns.set(pattern.getId(), pattern));
		init.patternProperties.forEach(prop => this.patternProperties.set(prop.getId(), prop));
		this.state = init.state;
	}

	public static Defaults() {
		return {
			bundleId: uuid.v4(),
			bundle: '',
			color: '',
			description: '',
			id: uuid.v4(),
			image: '',
			name: 'Library',
			version: '1.0.0',
			origin: Types.PatternLibraryOrigin.UserProvided,
			patterns: [],
			patternProperties: [],
			state: Types.PatternLibraryState.Connected,
			packageFile: {},
			installType: Types.PatternLibraryInstallType.Local
		};
	}

	public static create(init: PatternLibraryInit): PatternLibrary {
		return new PatternLibrary(init);
	}

	public static fromAnalysis(
		analysis: Types.LibraryAnalysis,
		opts: {
			analyzeBuiltins: boolean;
			project: Project;
			installType: Types.PatternLibraryInstallType;
		}
	): PatternLibrary {
		const library = PatternLibrary.create({
			id: uuid.v4(),
			name: analysis.name,
			version: analysis.version,
			origin: opts.analyzeBuiltins
				? Types.PatternLibraryOrigin.BuiltIn
				: Types.PatternLibraryOrigin.UserProvided,
			patternProperties: [],
			patterns: [],
			bundle: analysis.bundle,
			bundleId: analysis.id,
			description: analysis.description,
			image: analysis.image,
			color: analysis.color,
			state: Types.PatternLibraryState.Connected,
			packageFile: analysis.packageFile,
			installType: opts.installType
		});

		library.import(analysis, { project: opts.project });

		return library;
	}

	public static from(serialized: Types.SerializedPatternLibrary): PatternLibrary {
		const state = deserializeState(serialized.state);

		const patternLibrary = new PatternLibrary({
			bundleId: serialized.bundleId,
			bundle: serialized.bundle,
			color: serialized.color,
			description: serialized.description,
			id: serialized.id,
			image: serialized.image,
			name: serialized.name,
			version: serialized.version,
			origin: deserializeOrigin(serialized.origin),
			patterns: [],
			patternProperties: serialized.patternProperties.map(p => PatternProperty.from(p)),
			state,
			packageFile: serialized.packageFile,
			installType: serialized.installType
		});

		serialized.patterns.forEach(pattern => {
			patternLibrary.addPattern(Pattern.from(pattern, { patternLibrary }));
		});

		return patternLibrary;
	}

	public static fromDefaults(): PatternLibrary {
		return new PatternLibrary(PatternLibrary.Defaults());
	}

	@Mobx.action
	public import(analysis: Types.LibraryAnalysis, { project }: { project: Project }): void {
		const patternsBefore = this.getPatterns();
		const patternsAfter = analysis.patterns.map(item =>
			Pattern.from(item.pattern, { patternLibrary: this })
		);

		const patternChanges = computeDifference({
			before: patternsBefore,
			after: patternsAfter
		});

		patternChanges.removed.map(change => {
			this.removePattern(change.before);
		});

		patternChanges.added.map(change => {
			this.addPattern(change.after);
		});

		patternChanges.changed.map(change => {
			change.before.update(change.after, { patternLibrary: this });
		});

		const propMap: Map<string, Pattern> = new Map();

		const props = analysis.patterns.reduce((p: AnyPatternProperty[], patternAnalysis) => {
			const pattern = Pattern.from(patternAnalysis.pattern, { patternLibrary: this });

			patternAnalysis.properties.forEach(prop => {
				const patternProperty = PatternProperty.from(prop);
				p.push(patternProperty);
				propMap.set(patternProperty.getId(), pattern);
			});
			return p;
		}, []);

		const propChanges = computeDifference({
			before: this.getPatternProperties(),
			after: props
		});

		propChanges.removed.map(change => {
			this.removeProperty(change.before);
		});

		propChanges.added.map(change => {
			const pattern = propMap.get(change.after.getId());
			const p = pattern ? this.getPatternById(pattern.getId()) : undefined;

			this.addProperty(change.after);

			if (p) {
				p.addProperty(change.after);
			}
		});

		propChanges.changed.map(change => change.before.update(change.after));

		const touchedPatterns = [...patternChanges.added, ...patternChanges.changed].map(
			change => change.after
		);

		// TODO: This might be solved via a bigger refactoring that
		// computes available element contents from pattern slots directly
		touchedPatterns.forEach(pattern => {
			project.getElementsByPattern(pattern).forEach(element => {
				const contents = element.getContents();

				pattern
					.getSlots()
					// Check if there is a corresponding element content for each pattern slot
					.filter(slot => !contents.some(content => content.getSlotId() === slot.getId()))
					.forEach(slot => {
						// No element content, create a new one and add it to element
						const content = ElementContent.fromSlot(slot, { project });
						content.setParentElement(element);
						element.addContent(content);
						project.addElementContent(content);
					});
			});
		});

		this.setState(Types.PatternLibraryState.Connected);

		this.setBundle(analysis.bundle);
		this.setBundleId(analysis.id);
	}
	public equals(b: PatternLibrary): boolean {
		return isEqual(this.toJSON(), b.toJSON());
	}

	@Mobx.action
	public addPattern(pattern: Pattern): void {
		this.patterns.set(pattern.getId(), pattern);
	}

	@Mobx.action
	public addProperty(property: AnyPatternProperty): void {
		this.patternProperties.set(property.getId(), property);
	}

	public assignEnumOptionId(enumId: string, contextId: string): string {
		const enumProperty = this.getPatternPropertyById(enumId) as PatternEnumProperty;

		if (!enumProperty || typeof enumProperty.getOptionByContextId !== 'function') {
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

	public getDescription(): string {
		return this.description;
	}

	public getBundle(): string {
		return this.bundle;
	}

	public getBundleId(): string {
		return this.bundleId;
	}

	public getBundleHash(): string {
		return md5(this.bundle);
	}

	public getColor(): string {
		return this.color;
	}

	public getCapabilites(): Types.LibraryCapability[] {
		const isUserProvided = this.origin === Types.PatternLibraryOrigin.UserProvided;

		if (!isUserProvided) {
			return [];
		}

		const isConnected = this.state === Types.PatternLibraryState.Connected;

		return [
			isConnected && Types.LibraryCapability.Disconnect,
			isConnected && Types.LibraryCapability.Update,
			isConnected && Types.LibraryCapability.SetPath,
			Types.LibraryCapability.Reconnect
		].filter(
			(capability): capability is Types.LibraryCapability => typeof capability !== 'undefined'
		);
	}

	public getId(): string {
		return this.id;
	}

	public getName(): string {
		return this.name;
	}

	public getPackageName(): string {
		return this.packageFile ? (this.packageFile as { name: string }).name : this.name;
	}

	public getVersion(): string {
		return this.version;
	}

	public getOrigin(): Types.PatternLibraryOrigin {
		return this.origin;
	}

	public getPatternByContextId(contextId: string): Pattern | undefined {
		return this.getPatterns().find(pattern => pattern.getContextId() === contextId);
	}

	public getPatternById(id: string): Pattern | undefined {
		return this.patterns.get(id);
	}

	public getPatternByType(type: Types.PatternType): Pattern {
		return this.getPatterns().find(pattern => pattern.getType() === type) as Pattern;
	}

	public getPatternProperties(): AnyPatternProperty[] {
		return [...this.patternProperties.values()];
	}

	public getPatternPropertyById(id: string): AnyPatternProperty | undefined {
		return this.patternProperties.get(id);
	}

	public getPatternSlotById(id: string): PatternSlot | undefined {
		return this.getSlots().find(slot => slot.getId() === id);
	}

	public getPatterns(ids?: string[]): Pattern[] {
		if (typeof ids === 'undefined') {
			return [...this.patterns.values()];
		}

		return ids
			.map(id => this.getPatternById(id))
			.filter((pattern): pattern is Pattern => typeof pattern !== 'undefined');
	}

	public getSlots(): PatternSlot[] {
		return this.slots;
	}

	public getState(): Types.PatternLibraryState {
		return this.state;
	}

	public getImage(): string {
		return this.image;
	}

	public getInstallType(): Types.PatternLibraryInstallType {
		return this.installType;
	}

	@Mobx.action
	public removePattern(pattern: Pattern): void {
		this.patterns.delete(pattern.getId());
	}

	@Mobx.action
	public removeProperty(property: AnyPatternProperty): void {
		this.patternProperties.delete(property.getId());
	}

	@Mobx.action
	public setBundle(bundle: string): void {
		this.bundle = bundle;
	}

	@Mobx.action
	public setBundleId(bundleId: string): void {
		this.bundleId = bundleId;
	}

	@Mobx.action
	public setDescription(description: string): void {
		this.description = description;
	}

	@Mobx.action
	public setName(name: string): void {
		this.name = name;
	}

	@Mobx.action
	public setState(state: Types.PatternLibraryState): void {
		this.state = state;
	}

	public toJSON(): Types.SerializedPatternLibrary {
		return {
			model: this.model,
			bundleId: this.bundleId,
			bundle: this.bundle,
			color: this.color,
			description: this.description,
			id: this.id,
			image: this.image,
			name: this.name,
			version: this.version,
			origin: serializeOrigin(this.origin),
			patterns: this.getPatterns().map(p => p.toJSON()),
			patternProperties: this.getPatternProperties().map(p => p.toJSON()),
			state: this.state,
			packageFile: this.packageFile,
			installType: this.installType
		};
	}

	@Mobx.action
	public update(b: PatternLibrary): void {
		this.bundleId = b.bundleId;
		this.bundle = b.bundle;
		this.description = b.description;
		this.image = b.image;
		this.name = b.name;
		this.origin = b.origin;
		this.state = this.state;

		const patternChanges = computeDifference<Pattern>({
			before: this.getPatterns(),
			after: b.getPatterns()
		});

		patternChanges.added.forEach(change => this.addPattern(change.after));
		patternChanges.changed.forEach(change =>
			change.before.update(change.after, { patternLibrary: this })
		);
		patternChanges.removed.forEach(change => this.removePattern(change.before));

		const propertyChanges = computeDifference<AnyPatternProperty>({
			before: this.getPatternProperties(),
			after: b.getPatternProperties()
		});

		propertyChanges.added.forEach(change => this.addProperty(change.after));
		propertyChanges.changed.forEach(change => change.before.update(change.after));
		propertyChanges.removed.forEach(change => this.removeProperty(change.before));
	}
}

function deserializeState(
	input: 'pristine' | 'connected' | 'disconnected' | 'connecting'
): Types.PatternLibraryState {
	switch (input) {
		case 'pristine':
			return Types.PatternLibraryState.Pristine;
		case 'connecting':
			return Types.PatternLibraryState.Connecting;
		case 'connected':
			return Types.PatternLibraryState.Connected;
		case 'disconnected':
			return Types.PatternLibraryState.Disconnected;
	}
}

function deserializeOrigin(
	input: Types.SerializedPatternLibraryOrigin
): Types.PatternLibraryOrigin {
	switch (input) {
		case 'built-in':
			return Types.PatternLibraryOrigin.BuiltIn;
		case 'user-provided':
			return Types.PatternLibraryOrigin.UserProvided;
	}
	throw new Error(`Unknown pattern library origin: ${input}`);
}

function serializeOrigin(input: Types.PatternLibraryOrigin): Types.SerializedPatternLibraryOrigin {
	switch (input) {
		case Types.PatternLibraryOrigin.BuiltIn:
			return 'built-in';
		case Types.PatternLibraryOrigin.UserProvided:
			return 'user-provided';
	}
	throw new Error(`Unknown pattern library origin: ${input}`);
}
