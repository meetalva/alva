import { deserializeOrigin, PatternPropertyBase, serializeOrigin } from './property-base';
import * as Types from '../types';

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
			hidden: serialized.hidden,
			defaultValue: serialized.defaultValue,
			id: serialized.id,
			label: serialized.label,
			origin: deserializeOrigin(serialized.origin),
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
			contextId: this.contextId,
			hidden: this.hidden,
			defaultValue: this.defaultValue,
			id: this.id,
			label: this.label,
			origin: serializeOrigin(this.origin),
			propertyName: this.propertyName,
			required: this.required,
			type: this.type
		};
	}

	public update(prop: PatternBooleanProperty): void {
		this.contextId = prop.getContextId();
		this.label = prop.getLabel();
		this.propertyName = prop.getPropertyName();
		this.hidden = prop.getHidden();
		this.required = prop.getRequired();
		this.defaultValue = prop.getDefaultValue();
	}
}
