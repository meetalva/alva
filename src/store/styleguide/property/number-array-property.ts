import { Property } from './property';

/**
 * A number array property is a property that supports a list of numbers only.
 * As designer content value (raw value), the number array property accepts
 * strings, numbers, undefined, and null, both as an array or as a single value.
 * See coerceValue(). But everything is converted into a proper array of numbers.
 * @see Property
 */
export class NumberArrayProperty extends Property {
	/**
	 * Creates a new number array property.
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
	public async coerceValue(value: any): Promise<any> {
		// tslint:disable-next-line:no-any
		return this.coerceArrayValue(value, (element: any) => parseFloat(value));
	}

	/**
	 * @inheritdoc
	 */
	public getType(): string {
		return 'number[]';
	}

	/**
	 * @inheritdoc
	 */
	public toString(): string {
		return `NumberArrayProperty(${super.toString()})`;
	}
}
