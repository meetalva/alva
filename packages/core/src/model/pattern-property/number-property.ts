import { deserializeOrigin, PatternPropertyBase, serializeOrigin } from './property-base';
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
			origin: deserializeOrigin(serialized.origin),
			propertyName: serialized.propertyName,
			required: serialized.required
		});
	}

	public coerceValue(value: unknown): number | undefined {
		const result = typeof value === 'string' ? parseFloat(value) : undefined;

		if (typeof result === 'number' && !Number.isNaN(result)) {
			return result;
		}

		return this.required ? 0 : undefined;
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
			origin: serializeOrigin(this.origin),
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
