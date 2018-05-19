import { PatternPropertyBase, PatternPropertyType } from './property-base';
import * as Types from '../types';

/**
 * A number array property is a property that supports a list of numbers only.
 * As designer content value (raw value), the number array property accepts
 * strings, numbers, undefined, and null, both as an array or as a single value.
 * See coerceValue(). But everything is converted into a proper array of numbers.
 * @see Property
 */
export class PatternNumberArrayProperty extends PatternPropertyBase<number[]> {
	public readonly type = PatternPropertyType.NumberArray;

	public static from(
		serialized: Types.SerializedPatternNumberArrayProperty
	): PatternNumberArrayProperty {
		return new PatternNumberArrayProperty({
			hidden: serialized.hidden,
			defaultValue: serialized.defaultValue,
			id: serialized.id,
			label: serialized.label,
			propertyName: serialized.propertyName,
			required: serialized.required
		});
	}

	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		// tslint:disable-next-line:no-any
		return this.coerceArrayValue(value, (element: any) => parseFloat(value));
	}

	public toJSON(): Types.SerializedPatternNumberArrayProperty {
		return {
			hidden: this.hidden,
			defaultValue: this.defaultValue,
			id: this.id,
			label: this.label,
			propertyName: this.propertyName,
			required: this.required,
			type: this.type
		};
	}
}
