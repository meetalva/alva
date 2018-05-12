import { PatternProperty, PatternPropertyInit, PatternPropertyType } from './property';
import * as Types from '../types';

export interface PatternEnumPropertyInit extends PatternPropertyInit {
	options: PatternEnumPropertyOption[];
}

/**
 * An enum property is a property that supports the elements of a given enum only, and undefined.
 * As designer content value (raw value), the property accepts the option ID (JavaScript name),
 * option name (human-friendly name), and option ordinal (assigned number value),
 * but everything is converted into the option ID.
 * When rendering however, the value is converted into the ordinal,
 * as this is the runtime equivalent.
 * @see Property
 */
export class PatternEnumProperty extends PatternProperty {
	private options: PatternEnumPropertyOption[];

	public readonly type = PatternPropertyType.Enum;

	public constructor(init: PatternEnumPropertyInit) {
		super(init);
		this.options = init.options;
	}

	public static from(
		serializedProperty: Types.SerializedPatternEnumProperty
	): PatternEnumProperty {
		return new PatternEnumProperty({
			hidden: serializedProperty.hidden,
			defaultValue: serializedProperty.defaultValue,
			id: serializedProperty.id,
			label: serializedProperty.label,
			options: serializedProperty.options.map(serializedOption =>
				PatternEnumPropertyOption.from(serializedOption)
			),
			propertyName: serializedProperty.propertyName,
			required: serializedProperty.required
		});
	}

	/**
	 * @inheritdoc
	 */
	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		if (value === null || value === undefined || value === '') {
			return;
		}

		for (const option of this.options) {
			if (option.getId() === value.toString()) {
				return option.getId();
			}
		}

		const valueNumber = parseInt(value, 10);
		for (const option of this.options) {
			if (option.getOrdinal() === valueNumber) {
				return option.getId();
			}
		}

		for (const option of this.options) {
			if (option.getName() === value.toString()) {
				return option.getId();
			}
		}

		return String(value);
	}

	/**
	 * Returns the option ordinal (assigned number value) for a given option ID.
	 * @param id The option ID.
	 * @return The ordinal if an option with this ID exists.
	 */
	public getOptionById(id: string): PatternEnumPropertyOption | undefined {
		return this.options.find(option => option.getId() === id);
	}

	/**
	 * Returns the options supported by this enum.
	 * @return The options supported by this enum.
	 */
	public getOptions(): PatternEnumPropertyOption[] {
		return this.options;
	}

	public toJSON(): Types.SerializedPatternEnumProperty {
		return {
			hidden: this.hidden,
			defaultValue: this.defaultValue,
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
	value: string;
}

export class PatternEnumPropertyOption {
	private id: string;
	private name: string;
	private ordinal: number;
	private value: string;

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

	public getValue(): string {
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
