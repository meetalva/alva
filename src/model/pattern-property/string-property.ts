import { PatternPropertyBase, PatternPropertyType } from './property-base';
import * as Types from '../types';

/**
 * A string property is a property that supports text only.
 * As designer content value (raw value), the string property accepts
 * numbers, undefined, and null, as well (see coerceValue()),
 * but everything is converted into a proper string (never undefined or null).
 * @see Property
 */
export class PatternStringProperty extends PatternPropertyBase {
	public readonly type = PatternPropertyType.String;

	public static from(serialized: Types.SerializedStringProperty): PatternStringProperty {
		return new PatternStringProperty({
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
		if (value === null || value === undefined || value === '') {
			return '';
		} else {
			return String(value);
		}
	}

	public toJSON(): Types.SerializedStringProperty {
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
