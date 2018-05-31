import * as AlvaUtil from '../../alva-util';
import * as Mobx from 'mobx';
import { PatternFolder } from '../pattern-folder';
import { PatternLibrary } from '../pattern-library';
import * as PatternProperty from '../pattern-property';
import { PatternSlot } from './pattern-slot';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface PatternInit {
	contextId: string;
	description: string;
	exportName: string;
	id?: string;
	name: string;
	origin: Types.PatternOrigin;
	propertyIds: string[];
	slots: PatternSlot[];
	type: Types.PatternType;
}

export interface PatternContext {
	patternLibrary: PatternLibrary;
}

export class Pattern {
	@Mobx.observable private contextId: string;
	@Mobx.observable private description: string;
	@Mobx.observable private exportName: string;
	@Mobx.observable private folder: PatternFolder;
	@Mobx.observable private id: string;
	@Mobx.observable private name: string;
	@Mobx.observable private origin: Types.PatternOrigin;
	@Mobx.observable private patternLibrary: PatternLibrary;
	@Mobx.observable private propertyIds: string[];
	@Mobx.observable private slots: PatternSlot[];
	@Mobx.observable private type: Types.PatternType;

	public constructor(init: PatternInit, context: PatternContext) {
		this.contextId = init.contextId;
		this.description = init.description;
		this.exportName = init.exportName;
		this.id = init.id || uuid.v4();
		this.name = AlvaUtil.guessName(init.name);
		this.origin = init.origin;
		this.patternLibrary = context.patternLibrary;
		this.propertyIds = init.propertyIds;
		this.slots = init.slots;
		this.type = init.type;
	}

	public static from(serialized: Types.SerializedPattern, context: PatternContext): Pattern {
		return new Pattern(
			{
				contextId: serialized.contextId,
				description: serialized.description,
				exportName: serialized.exportName,
				id: serialized.id,
				name: serialized.name,
				origin: deserializeOrigin(serialized.origin),
				propertyIds: serialized.propertyIds,
				slots: serialized.slots.map(slot => PatternSlot.from(slot)),
				type: deserializeType(serialized.type)
			},
			context
		);
	}

	public addSlot(slot: PatternSlot): void {
		this.slots.push(slot);
	}

	public getContextId(): string {
		return this.contextId;
	}

	public getDescription(): string {
		return this.description;
	}

	public getExportName(): string {
		return this.exportName;
	}

	public getFolder(): PatternFolder {
		return this.folder;
	}

	public getId(): string {
		return this.id;
	}

	public getName(): string {
		return this.name;
	}

	public getOrigin(): Types.PatternOrigin {
		return this.origin;
	}

	public getProperties(): PatternProperty.AnyPatternProperty[] {
		return this.propertyIds
			.map(propertyId => this.patternLibrary.getPatternPropertyById(propertyId))
			.filter((p): p is PatternProperty.AnyPatternProperty => typeof p !== 'undefined');
	}

	public getPropertyByContextId(
		contextId: string
	): PatternProperty.AnyPatternProperty | undefined {
		return this.getProperties().find(p => p.getContextId() === contextId);
	}

	public getPropertyIds(): string[] {
		return this.propertyIds;
	}

	public getSlots(): PatternSlot[] {
		return this.slots;
	}

	public getType(): Types.PatternType {
		return this.type;
	}

	public toJSON(): Types.SerializedPattern {
		return {
			contextId: this.contextId,
			description: this.description,
			exportName: this.exportName,
			id: this.id,
			name: this.name,
			origin: serializeOrigin(this.origin),
			propertyIds: Array.from(this.propertyIds),
			slots: this.slots.map(slot => slot.toJSON()),
			type: serializeType(this.type)
		};
	}

	public update(pattern: Pattern, context: PatternContext): void {
		this.contextId = pattern.getContextId();
		this.description = pattern.getDescription();
		this.exportName = pattern.getExportName();
		this.name = pattern.getName();
		this.origin = pattern.getOrigin();
		this.patternLibrary = context.patternLibrary;
		this.propertyIds = pattern.getPropertyIds();
		this.slots = pattern.getSlots();
		this.type = pattern.getType();
	}
}

function deserializeOrigin(input: Types.SerializedPatternOrigin): Types.PatternOrigin {
	switch (input) {
		case 'built-in':
			return Types.PatternOrigin.BuiltIn;
		case 'user-provided':
			return Types.PatternOrigin.UserProvided;
	}
	throw new Error(`Unknown pattern type: ${input}`);
}

function deserializeType(input: Types.SerializedPatternType): Types.PatternType {
	switch (input) {
		case 'synthetic:page':
			return Types.PatternType.SyntheticPage;
		case 'synthetic:box':
			return Types.PatternType.SyntheticBox;
		case 'synthetic:image':
			return Types.PatternType.SyntheticImage;
		case 'synthetic:text':
			return Types.PatternType.SyntheticText;
		case 'pattern':
			return Types.PatternType.Pattern;
	}
	throw new Error(`Unknown pattern type: ${input}`);
}

function serializeOrigin(input: Types.PatternOrigin): Types.SerializedPatternOrigin {
	switch (input) {
		case Types.PatternOrigin.BuiltIn:
			return 'built-in';
		case Types.PatternOrigin.UserProvided:
			return 'user-provided';
	}
	throw new Error(`Unknown pattern origin: ${input}`);
}

function serializeType(input: Types.PatternType): Types.SerializedPatternType {
	switch (input) {
		case Types.PatternType.SyntheticPage:
			return 'synthetic:page';
		case Types.PatternType.SyntheticBox:
			return 'synthetic:box';
		case Types.PatternType.SyntheticImage:
			return 'synthetic:image';
		case Types.PatternType.SyntheticText:
			return 'synthetic:text';
		case Types.PatternType.Pattern:
			return 'pattern';
	}
	throw new Error(`Unknown pattern type: ${input}`);
}
