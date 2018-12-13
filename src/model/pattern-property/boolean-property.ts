import { PatternPropertyBase } from './property-base';
import * as Types from '../../types';

/**
 * A boolean property is a property that supports the values true and false only.
 * As designer content value (raw value), the boolean property accepts the strings
 * "true" and "false", and the numbers 1 and 0, as well (see coerceValue()).
 * @see Property
 */
export class PatternBooleanProperty extends PatternPropertyBase<boolean | undefined> {
	public readonly type = Types.PatternPropertyType.Boolean;

	public static from(serialized: Types.SerializedPatternBooleanProperty): PatternBooleanProperty {
		return new PatternBooleanProperty({
			contextId: serialized.contextId,
			defaultValue: serialized.defaultValue,
			description: serialized.description,
			example: serialized.example,
			group: serialized.group,
			hidden: serialized.hidden,
			id: serialized.id,
			inputType: serialized.inputType,
			label: serialized.label,
			propertyName: serialized.propertyName,
			required: serialized.required
		});
	}

	// tslint:disable-next-line:no-any
	public coerceValue(value: any): boolean {
		return value === true || value === 'true' || value === 1;
	}

	public toJSON(): Types.SerializedPatternBooleanProperty {
		return {
			model: this.model,
			contextId: this.contextId,
			defaultValue: this.defaultValue,
			description: this.description,
			example: this.example,
			group: this.group,
			hidden: this.hidden,
			id: this.id,
			inputType: this.inputType,
			label: this.label,
			propertyName: this.propertyName,
			required: this.required,
			type: this.type
		};
	}

	public update(prop: PatternBooleanProperty): void {
		this.contextId = prop.getContextId();
		this.defaultValue = prop.getDefaultValue();
		this.description = prop.getDescription();
		this.group = prop.getGroup();
		this.hidden = prop.getHidden();
		this.label = prop.getLabel();
		this.propertyName = prop.getPropertyName();
		this.required = prop.getRequired();
		this.defaultValue = prop.getDefaultValue();
	}
}
