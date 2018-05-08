import { Property, PropertyType } from './property';
import * as Types from '../../types';

/**
 * A number array property is a property that supports a list of numbers only.
 * As designer content value (raw value), the number array property accepts
 * strings, numbers, undefined, and null, both as an array or as a single value.
 * See coerceValue(). But everything is converted into a proper array of numbers.
 * @see Property
 */
export class NumberArrayProperty extends Property {
	public readonly type = PropertyType.NumberArray;

	/**
	 * @inheritdoc
	 */
	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		// tslint:disable-next-line:no-any
		return this.coerceArrayValue(value, (element: any) => parseFloat(value));
	}

	public toJSON(): Types.SerializedNumberArrayProperty {
		return {
			hidden: this.hidden,
			defaultValue: this.defaultValue,
			id: this.id,
			name: this.name,
			required: this.required,
			type: this.type
		};
	}
}
