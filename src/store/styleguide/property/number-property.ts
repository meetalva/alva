import { Property } from './property';

/**
 * A number property is a property that supports numbers only, and undefined.
 * As designer content value (raw value), the number property accepts
 * strings, undefined, and null, as well (see coerceValue()),
 * but everything is converted into a proper number, or undefined.
 * @see Property
 */
export class NumberProperty extends Property {
	/**
	 * Creates a new number property.
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
		const result: number = parseFloat(value);
		return isNaN(result) ? undefined : result;
	}

	/**
	 * @inheritdoc
	 */
	public getType(): string {
		return 'number';
	}

	/**
	 * @inheritdoc
	 */
	public toString(): string {
		return `NumberProperty(${super.toString()})`;
	}
}
