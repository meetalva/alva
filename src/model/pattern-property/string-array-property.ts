import { PatternPropertyBase, PatternPropertyType } from './property-base';
import * as Types from '../types';

/**
 * A string array property is a property that supports a list of text only.
 * As designer content value (raw value), the string array property accepts
 * strings, numbers, undefined, and null, both as an array or as a single value.
 * See coerceValue(). But everything is converted into a proper string array
 * (where all elements are never undefined or null).
 * @see Property
 */
export class PatternStringArrayProperty extends PatternPropertyBase<string[]> {
	public readonly type = PatternPropertyType.StringArray;

	public static from(
		serialized: Types.SerializedPatternStringArrayProperty
	): PatternStringArrayProperty {
		return new PatternStringArrayProperty({
			hidden: serialized.hidden,
			defaultValue: serialized.defaultValue,
			id: serialized.id,
			label: serialized.label,
			propertyName: serialized.propertyName,
			required: serialized.required
		});
	}

	/**
	 * @inheritdoc
	 */
	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		// tslint:disable-next-line:no-any
		return this.coerceArrayValue(value, (element: any) => String(value));
	}

	public toJSON(): Types.SerializedPatternStringArrayProperty {
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
