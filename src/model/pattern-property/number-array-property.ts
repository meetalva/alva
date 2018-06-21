import * as AlvaUtil from '../../alva-util';
import { deserializeOrigin, PatternPropertyBase, serializeOrigin } from './property-base';
import * as Types from '../../types';

/**
 * A number array property is a property that supports a list of numbers only.
 * As designer content value (raw value), the number array property accepts
 * strings, numbers, undefined, and null, both as an array or as a single value.
 * See coerceValue(). But everything is converted into a proper array of numbers.
 * @see Property
 */
export class PatternNumberArrayProperty extends PatternPropertyBase<number[]> {
	public readonly type = Types.PatternPropertyType.NumberArray;

	public static from(
		serialized: Types.SerializedPatternNumberArrayProperty
	): PatternNumberArrayProperty {
		return new PatternNumberArrayProperty({
			contextId: serialized.contextId,
			hidden: serialized.hidden,
			defaultValue: serialized.defaultValue,
			example: serialized.example,
			id: serialized.id,
			label: serialized.label,
			origin: deserializeOrigin(serialized.origin),
			propertyName: serialized.propertyName,
			required: serialized.required
		});
	}

	public coerceValue<T>(value: T): number[] {
		return AlvaUtil.ensureArray(value).map(parseFloat);
	}

	public toJSON(): Types.SerializedPatternNumberArrayProperty {
		return {
			contextId: this.contextId,
			defaultValue: this.defaultValue,
			description: this.description,
			example: this.example,
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

	public update(prop: PatternNumberArrayProperty): void {
		this.contextId = prop.getContextId();
		this.description = prop.getDescription();
		this.example = prop.getExample();
		this.hidden = prop.getHidden();
		this.label = prop.getLabel();
		this.propertyName = prop.getPropertyName();
		this.required = prop.getRequired();
	}
}
