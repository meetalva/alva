import { PatternPropertyBase, PatternPropertyType } from './property-base';
import * as Types from '../types';

export interface PatternEnumPropertyInit {
	defaultOptionId?: string;
	hidden: boolean;
	id: string;
	label: string;
	options: PatternEnumPropertyOption[];
	propertyName: string;
	required: boolean;
}

export type EnumValue = string | number;

export class PatternEnumProperty extends PatternPropertyBase<EnumValue | undefined> {
	private defaultOptionId?: string;
	private options: PatternEnumPropertyOption[] = [];

	public readonly type = PatternPropertyType.Enum;

	public constructor(init: PatternEnumPropertyInit) {
		super(init);
		this.options = init.options;
		this.defaultOptionId = init.defaultOptionId;
	}

	public static from(
		serializedProperty: Types.SerializedPatternEnumProperty
	): PatternEnumProperty {
		return new PatternEnumProperty({
			hidden: serializedProperty.hidden,
			defaultOptionId: serializedProperty.defaultOptionId,
			id: serializedProperty.id,
			label: serializedProperty.label,
			options: serializedProperty.options.map(serializedOption =>
				PatternEnumPropertyOption.from(serializedOption)
			),
			propertyName: serializedProperty.propertyName,
			required: serializedProperty.required
		});
	}

	// tslint:disable-next-line:no-any
	public coerceValue(value: any): EnumValue | undefined {
		if (typeof value !== 'string' && typeof value !== 'number') {
			return;
		}

		if (typeof value === 'number' && Number.isNaN(value)) {
			return;
		}

		return value;
	}

	public getDefaultValue(): EnumValue | undefined {
		const option = this.options.find(o => o.getId() === this.defaultOptionId);

		if (!option) {
			return;
		}

		return option.getValue();
	}

	public getOptionById(id: string): PatternEnumPropertyOption | undefined {
		return this.options.find(option => option.getId() === id);
	}

	public getOptionByValue(value: EnumValue): PatternEnumPropertyOption | undefined {
		return this.options.find(option => option.getValue() === value);
	}

	public getOptions(): PatternEnumPropertyOption[] {
		return this.options;
	}

	public toJSON(): Types.SerializedPatternEnumProperty {
		return {
			defaultOptionId: this.defaultOptionId,
			hidden: this.hidden,
			id: this.id,
			label: this.label,
			propertyName: this.propertyName,
			options: this.options.map(option => option.toJSON()),
			required: this.required,
			type: this.type
		};
	}
}

export interface PatternEnumPropertyOptionInit {
	id: string;
	name: string;
	ordinal: number;
	value: string | number;
}

export class PatternEnumPropertyOption {
	private id: string;
	private name: string;
	private ordinal: number;
	private value: string | number;

	public constructor(init: PatternEnumPropertyOptionInit) {
		this.id = init.id;
		this.name = init.name;
		this.ordinal = init.ordinal;
		this.value = init.value;
	}

	public static from(serialized: Types.SerializedEnumOption): PatternEnumPropertyOption {
		return new PatternEnumPropertyOption(serialized);
	}

	public getId(): string {
		return this.id;
	}

	public getName(): string {
		return this.name;
	}

	public getOrdinal(): number {
		return this.ordinal;
	}

	public getValue(): string | number {
		return this.value;
	}

	public toJSON(): Types.SerializedEnumOption {
		return {
			id: this.id,
			name: this.name,
			ordinal: this.ordinal,
			value: this.value
		};
	}
}
