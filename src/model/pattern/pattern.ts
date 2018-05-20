import * as AlvaUtil from '../../alva-util';
import { PatternFolder } from './pattern-folder';
import { PatternLibrary } from '../pattern-library';
import * as PatternProperty from '../pattern-property';
import { PatternSlot } from './pattern-slot';
import * as Types from '../types';
import * as uuid from 'uuid';

export type PatternType = SyntheticPatternType | ConcretePatternType;

export enum SyntheticPatternType {
	SyntheticBox = 'synthetic:box',
	SyntheticPage = 'synthetic:page',
	SyntheticPlaceholder = 'synthetic:placeholder',
	SyntheticText = 'synthetic:text'
}

export enum ConcretePatternType {
	Pattern = 'pattern'
}

export interface PatternInit {
	exportName?: string;
	id?: string;
	name: string;
	propertyIds?: string[];
	slots?: PatternSlot[];
	type: PatternType;
}

export interface PatternContext {
	patternLibrary: PatternLibrary;
}

export class Pattern {

	private contextId: string;

	private exportName: string;

	private folder: PatternFolder;

	private id: string;

	private name: string;

	private patternLibrary: PatternLibrary;

	private propertyIds: string[];

	private slots: PatternSlot[];

	private type: PatternType;

	public constructor(init: PatternInit, context: PatternContext) {
		this.exportName = init.exportName || 'default';
		this.id = init.id || uuid.v4();
		this.name = AlvaUtil.guessName(init.name);
		this.patternLibrary = context.patternLibrary;
		this.propertyIds = init.propertyIds || [];
		this.type = init.type;
		this.slots = init.slots || [
			new PatternSlot({
				displayName: 'Children',
				propertyName: 'children',
				id: uuid.v4(),
				type: Types.SlotType.Children
			})
		];
	}

	public static from(serialized: Types.SerializedPattern, context: PatternContext): Pattern {
		return new Pattern(
			{
				exportName: serialized.exportName,
				id: serialized.id,
				name: serialized.name,
				propertyIds: serialized.propertyIds,
				slots: serialized.slots.map(slot => PatternSlot.from(slot)),
				type: stringToType(serialized.type)
			},
			context
		);
	}

	public addSlot(slot: PatternSlot): void {
		this.slots.push(slot);
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

	public getProperties(): PatternProperty.AnyPatternProperty[] {
		return this.propertyIds
			.map(propertyId => this.patternLibrary.getPatternPropertyById(propertyId))
			.filter((p): p is PatternProperty.AnyPatternProperty => typeof p !== 'undefined');
	}

	public getSlots(): PatternSlot[] {
		return this.slots;
	}

	public getType(): PatternType {
		return this.type;
	}

	public toJSON(): Types.SerializedPattern {
		return {
			contextId: this.contextId,
			exportName: this.exportName,
			id: this.id,
			name: this.name,
			propertyIds: this.propertyIds,
			slots: this.slots.map(slot => slot.toJSON()),
			type: this.type
		};
	}
}

const stringToType = (input: string): PatternType => {
	switch (input) {
		case 'synthetic:page':
			return SyntheticPatternType.SyntheticPage;
		case 'synthetic:placeholder':
			return SyntheticPatternType.SyntheticPlaceholder;
		case 'synthetic:text':
			return SyntheticPatternType.SyntheticText;
		case 'synthetic:box':
			return SyntheticPatternType.SyntheticBox;
		case 'pattern':
			return ConcretePatternType.Pattern;
		default:
			throw new Error(`Unknown pattern type ${input}`);
	}
};
