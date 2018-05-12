import * as Types from '../types';

export interface PatternSlotInit {
	displayName: string;
	id: string;
	propertyName: string;
	type: Types.SlotType;
}

export class PatternSlot {
	private displayName: string;
	private id: string;
	private propertyName: string;
	private type: Types.SlotType;

	public constructor(init: PatternSlotInit) {
		this.type = init.type;
		this.id = init.id;
		this.displayName = init.displayName;
		this.type = init.type;
	}

	public static from(serialized: Types.SerializedPatternSlot): PatternSlot {
		return new PatternSlot({
			displayName: serialized.displayName,
			id: serialized.id,
			propertyName: serialized.propertyName,
			type: toSlotType(serialized.type)
		});
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

	public getType(): Types.SlotType {
		return this.type;
	}

	public toJSON(): Types.SerializedPatternSlot {
		return {
			displayName: this.displayName,
			propertyName: this.propertyName,
			id: this.id,
			type: this.type
		};
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
