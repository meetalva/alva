import { PatternPropertyBase, PatternPropertyType } from './property-base';
import * as Types from '../types';

/**
 * A boolean property is a property that supports the values true and false only.
 * As designer content value (raw value), the boolean property accepts the strings
 * "true" and "false", and the numbers 1 and 0, as well (see coerceValue()).
 * @see Property
 */
export class PatternBooleanProperty extends PatternPropertyBase<boolean | undefined> {
	public readonly type = PatternPropertyType.Boolean;

	public static from(serialized: Types.SerializedPatternBooleanProperty): PatternBooleanProperty {
		return new PatternBooleanProperty({
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
		return value === true || value === 'true' || value === 1;
	}

	public toJSON(): Types.SerializedPatternBooleanProperty {
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
