import * as Types from '@meetalva/types';
import * as _ from 'lodash';
import * as uuid from 'uuid';

export interface PatternSlotInit {
	contextId: string;
	displayName: string;
	description: string;
	example: string;
	hidden: boolean;
	id: string;
	propertyName: string;
	required: boolean;
	type: Types.SlotType;
}

export class PatternSlot {
	public readonly model = Types.ModelName.PatternSlot;

	private contextId: string;
	private displayName: string;
	private description: string;
	private example: string;
	private hidden: boolean;
	private id: string;
	private propertyName: string;
	private required: boolean;
	private type: Types.SlotType;

	public constructor(init: PatternSlotInit) {
		this.type = init.type;
		this.id = init.id;
		this.displayName = init.displayName;
		this.description = init.description;
		this.example = init.example;
		this.hidden = init.hidden;
		this.required = init.required;
		this.type = init.type;
		this.propertyName = init.propertyName;
		this.contextId = init.contextId;
	}

	public static from(serialized: Types.SerializedPatternSlot): PatternSlot {
		return new PatternSlot({
			contextId: serialized.contextId,
			description: serialized.description,
			displayName: serialized.label,
			example: serialized.example,
			hidden: serialized.hidden,
			id: serialized.id,
			propertyName: serialized.propertyName,
			required: serialized.required,
			type: toSlotType(serialized.type)
		});
	}

	public clone(): PatternSlot {
		return new PatternSlot({
			contextId: this.contextId,
			description: this.description,
			displayName: this.displayName,
			example: this.example,
			hidden: this.hidden,
			id: uuid.v4(),
			propertyName: this.propertyName,
			required: this.required,
			type: toSlotType(this.type)
		});
	}

	public equals(b: PatternSlot): boolean {
		return _.isEqual(this.toJSON(), b.toJSON());
	}

	public getContextId(): string {
		return this.contextId;
	}

	public getHidden(): boolean {
		return this.hidden;
	}

	public getId(): string {
		return this.id;
	}

	public getName(): string {
		return this.displayName;
	}

	public getPropertyName(): string {
		return this.propertyName;
	}

	public getRequired(): boolean {
		return this.required;
	}

	public getType(): Types.SlotType {
		return this.type;
	}

	public toJSON(): Types.SerializedPatternSlot {
		return {
			model: this.model,
			contextId: this.contextId,
			description: this.description,
			defaultValue: undefined,
			example: this.example,
			hidden: this.hidden,
			label: this.displayName,
			propertyName: this.propertyName,
			id: this.id,
			required: this.required,
			type: this.type
		};
	}

	public update(b: PatternSlot): void {
		this.contextId = b.contextId;
		this.description = b.description;
		this.example = b.example;
		this.hidden = b.hidden;
		this.displayName = b.displayName;
		this.propertyName = b.propertyName;
		this.required = b.required;
		this.type = toSlotType(b.type);
	}
}

function toSlotType(type: string): Types.SlotType {
	switch (type) {
		case 'property':
			return Types.SlotType.Property;
		case 'children':
		default:
			return Types.SlotType.Children;
	}
}
