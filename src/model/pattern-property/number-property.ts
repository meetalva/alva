import { PatternPropertyBase } from './property-base';
import * as Types from '../../types';

/**
 * A number property is a property that supports numbers only, and undefined.
 * As designer content value (raw value), the number property accepts
 * strings, undefined, and null, as well (see coerceValue()),
 * but everything is converted into a proper number, or undefined.
 * @see Property
 */
export class PatternNumberProperty extends PatternPropertyBase<number | undefined> {
	public readonly type = Types.PatternPropertyType.Number;

	public static from(serialized: Types.SerializedPatternNumberProperty): PatternNumberProperty {
		return new PatternNumberProperty({
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
	public coerceValue(value: any): any {
		const result: number = parseFloat(value);
		return isNaN(result) ? undefined : result;
	}

	public toJSON(): Types.SerializedPatternNumberProperty {
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

	public update(prop: PatternNumberProperty): void {
		this.contextId = prop.getContextId();
		this.defaultValue = prop.getDefaultValue();
		this.description = prop.getDescription();
		this.example = prop.getExample();
		this.group = prop.getGroup();
		this.label = prop.getLabel();
		this.propertyName = prop.getPropertyName();
		this.hidden = prop.getHidden();
		this.required = prop.getRequired();
	}
}
