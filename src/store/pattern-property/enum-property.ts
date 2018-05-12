import { PatternProperty, PatternPropertyType } from './property';
import * as Types from '../types';

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
	/**
	 * The options supported by this enum.
	 */
	private options: Option[];

	/**
	 * A lookup to get the option ordinal (assigned number value) from an option ID.
	 */
	private ordinalById: { [id: string]: number } = {};

	public readonly type = PatternPropertyType.Enum;

	public static from(
		serializedProperty: Types.SerializedPatternEnumProperty
	): PatternEnumProperty {
		const property = new PatternEnumProperty({
			hidden: serializedProperty.hidden,
			defaultValue: serializedProperty.defaultValue,
			id: serializedProperty.id,
			label: serializedProperty.label,
			propertyName: serializedProperty.propertyName,
			required: serializedProperty.required
		});

		property.setOptions(
			serializedProperty.options.map(serializedOption => Option.from(serializedOption))
		);
		return property;
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
	 * @inheritdoc
	 */
	// tslint:disable-next-line:no-any
	public convertToRender(value: any): any {
		return this.ordinalById[value as string];
	}

	/**
	 * Returns the option ordinal (assigned number value) for a given option ID.
	 * @param id The option ID.
	 * @return The ordinal if an option with this ID exists.
	 */
	public getOptionById(id: string): Option | undefined {
		for (const option of this.options) {
			if (option.getId() === id) {
				return option;
			}
		}

		return;
	}

	/**
	 * Returns the options supported by this enum.
	 * @return The options supported by this enum.
	 */
	public getOptions(): Option[] {
		return this.options;
	}

	/**
	 * Sets the options supported by this enum.<br>
	 * <b>Note:</b> This method should only be called from the pattern parsers.
	 * @param options The options supported by this enum.
	 */
	public setOptions(options: Option[]): void {
		this.options = options;
		this.options.forEach((option: Option) => {
			this.ordinalById[option.getId()] = option.getOrdinal();
		});
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

export class Option {
	private id: string;
	private name: string;
	private ordinal: number;

	public constructor(id: string, name?: string, ordinal?: number) {
		this.id = id;
		this.name = name !== undefined ? name : id;
		this.ordinal = ordinal !== undefined ? ordinal : 0;
	}

	public static from(serializedOption: Types.SerializedEnumOption): Option {
		return new Option(serializedOption.id, serializedOption.name, serializedOption.ordinal);
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

	public toJSON(): Types.SerializedEnumOption {
		return {
			id: this.id,
			name: this.name,
			ordinal: this.ordinal
		};
	}
}
