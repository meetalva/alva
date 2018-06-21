import { deserializeOrigin, PatternPropertyBase, serializeOrigin } from './property-base';
import * as Types from '../../types';

/**
 * A string property is a property that supports text only.
 * As designer content value (raw value), the string property accepts
 * numbers, undefined, and null, as well (see coerceValue()),
 * but everything is converted into a proper string (never undefined or null).
 * @see Property
 */
export class PatternStringProperty extends PatternPropertyBase<string | undefined> {
	public readonly type = Types.PatternPropertyType.String;

	public static from(serialized: Types.SerializedStringProperty): PatternStringProperty {
		return new PatternStringProperty({
			contextId: serialized.contextId,
			defaultValue: serialized.defaultValue,
			description: serialized.description,
			example: serialized.example,
			hidden: serialized.hidden,
			id: serialized.id,
			label: serialized.label,
			origin: deserializeOrigin(serialized.origin),
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
			contextId: this.contextId,
			defaultValue: this.defaultValue,
			description: this.description,
			example: this.example || '',
			hidden: this.hidden,
			id: this.id,
			inputType: this.inputType,
			label: this.label,
			origin: serializeOrigin(this.origin),
			propertyName: this.propertyName,
			required: this.required,
			type: this.type
		};
	}

	public update(prop: PatternStringProperty): void {
		this.contextId = prop.getContextId();
		this.description = prop.getDescription();
		this.defaultValue = prop.getDefaultValue();
		this.example = prop.getExample();
		this.hidden = prop.getHidden();
		this.label = prop.getLabel();
		this.propertyName = prop.getPropertyName();
		this.required = prop.getRequired();
	}
}
