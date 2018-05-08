import { Property, PropertyType } from './property';
import * as Types from '../../types';

/**
 * A number property is a property that supports numbers only, and undefined.
 * As designer content value (raw value), the number property accepts
 * strings, undefined, and null, as well (see coerceValue()),
 * but everything is converted into a proper number, or undefined.
 * @see Property
 */
export class NumberProperty extends Property {
	public readonly type = PropertyType.Number;

	public static from(serialized: Types.SerializedNumberProperty): NumberProperty {
		return new NumberProperty({
			hidden: serialized.hidden,
			defaultValue: serialized.defaultValue,
			id: serialized.id,
			name: serialized.name,
			required: serialized.required
		});
	}

	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		const result: number = parseFloat(value);
		return isNaN(result) ? undefined : result;
	}

	public toJSON(): Types.SerializedNumberProperty {
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
