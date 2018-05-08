import { Property, PropertyType } from './property';
import * as Types from '../../types';

/**
 * A boolean property is a property that supports the values true and false only.
 * As designer content value (raw value), the boolean property accepts the strings
 * "true" and "false", and the numbers 1 and 0, as well (see coerceValue()).
 * @see Property
 */
export class BooleanProperty extends Property {
	public readonly type = PropertyType.Boolean;

	public static from(serialized: Types.SerializedBooleanProperty): BooleanProperty {
		return new BooleanProperty({
			hidden: serialized.hidden,
			defaultValue: serialized.defaultValue,
			id: serialized.id,
			name: serialized.name,
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

	public from(serializedProperty: Types.SerializedBooleanProperty): BooleanProperty {
		const property = new BooleanProperty({
			hidden: serializedProperty.hidden,
			defaultValue: serializedProperty.defaultValue,
			id: serializedProperty.id,
			name: serializedProperty.name,
			required: serializedProperty.required
		});

		return property;
	}

	public toJSON(): Types.SerializedBooleanProperty {
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
