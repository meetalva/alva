import { Property } from './property';

/**
 * A string array property is a property that supports a list of text only.
 * As designer content value (raw value), the string array property accepts
 * strings, numbers, undefined, and null, both as an array or as a single value.
 * See coerceValue(). But everything is converted into a proper string array
 * (where all elements are never undefined or null).
 * @see Property
 */
export class StringArrayProperty extends Property {
	/**
	 * Creates a new string array property.
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
		return this.coerceArrayValue(value, (element: any) => String(value));
	}

	/**
	 * @inheritdoc
	 */
	public getType(): string {
		return 'string[]';
	}

	/**
	 * @inheritdoc
	 */
	public toString(): string {
		return `StringArrayProperty(${super.toString()})`;
	}
}
