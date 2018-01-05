import { Property } from './property';

/**
 * A boolean property is a property that supports the values true and false only.
 * As designer content value (raw value), the boolean property accepts the strings
 * "true" and "false", and the numbers 1 and 0, as well (see coerceValue()).
 * @see Property
 */
export class BooleanProperty extends Property {
	/**
	 * Creates a new boolean property.
	 * @param id The technical ID of this property (e.g. the property name
	 * in the TypeScript props interface).
	 */
	public constructor(id: string) {
		super(id);
	}

	/**
	 * @inheritdoc
	 */
	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		return value === true || value === 'true' || value === 1;
	}

	/**
	 * @inheritdoc
	 */
	public getType(): string {
		return 'boolean';
	}

	/**
	 * @inheritdoc
	 */
	public toString(): string {
		return `BooleanProperty(${super.toString()})`;
	}
}
