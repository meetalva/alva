import { PatternPropertyBase, PatternPropertyType } from './property-base';
import * as Types from '../types';

/**
 * A number property is a property that supports numbers only, and undefined.
 * As designer content value (raw value), the number property accepts
 * strings, undefined, and null, as well (see coerceValue()),
 * but everything is converted into a proper number, or undefined.
 * @see Property
 */
export class PatternNumberProperty extends PatternPropertyBase<number | undefined> {
	public readonly type = PatternPropertyType.Number;

	public static from(serialized: Types.SerializedPatternNumberProperty): PatternNumberProperty {
		return new PatternNumberProperty({
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
		const result: number = parseFloat(value);
		return isNaN(result) ? undefined : result;
	}

	public toJSON(): Types.SerializedPatternNumberProperty {
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
