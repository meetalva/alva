import * as AlvaUtil from '../../alva-util';
import { deserializeOrigin, PatternPropertyBase, serializeOrigin } from './property-base';
import * as Types from '../types';

/**
 * A string array property is a property that supports a list of text only.
 * As designer content value (raw value), the string array property accepts
 * strings, numbers, undefined, and null, both as an array or as a single value.
 * See coerceValue(). But everything is converted into a proper string array
 * (where all elements are never undefined or null).
 * @see Property
 */
export class PatternStringArrayProperty extends PatternPropertyBase<string[]> {
	public readonly type = Types.PatternPropertyType.StringArray;

	public static from(
		serialized: Types.SerializedPatternStringArrayProperty
	): PatternStringArrayProperty {
		return new PatternStringArrayProperty({
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

	public coerceValue<T>(value: T): string[] {
		return AlvaUtil.ensureArray(value).map(
			item => (typeof item === 'string' ? item : item.toString())
		);
	}

	public toJSON(): Types.SerializedPatternStringArrayProperty {
		return {
			contextId: this.contextId,
			defaultValue: this.defaultValue,
			description: this.description,
			example: this.example,
			hidden: this.hidden,
			id: this.id,
			label: this.label,
			origin: serializeOrigin(this.origin),
			propertyName: this.propertyName,
			required: this.required,
			type: this.type
		};
	}

	public update(prop: PatternStringArrayProperty): void {
		this.contextId = prop.getContextId();
		this.description = prop.getDescription();
		this.example = prop.getExample();
		this.hidden = prop.getHidden();
		this.label = prop.getLabel();
		this.propertyName = prop.getPropertyName();
		this.required = prop.getRequired();
	}
}
