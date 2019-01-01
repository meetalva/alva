import {
	deserializeOrigin,
	PatternPropertyBase,
	serializeOrigin,
	PatternPropertyInit
} from './property-base';
import * as Types from '../../types';
import uuid = require('uuid');

/**
 * A string property is a property that supports text only.
 * As designer content value (raw value), the string property accepts
 * numbers, undefined, and null, as well (see coerceValue()),
 * but everything is converted into a proper string (never undefined or null).
 * @see Property
 */
export class PatternStringProperty extends PatternPropertyBase<string | undefined> {
	public readonly type = Types.PatternPropertyType.String;

	public static Defaults(
		mixins?: Partial<PatternPropertyInit<string>>
	): PatternPropertyInit<string> {
		return {
			contextId: 'stringProperty',
			defaultValue: 'Text',
			description: 'A string property',
			example: '',
			group: '',
			hidden: false,
			id: uuid.v4(),
			inputType: Types.PatternPropertyInputType.Default,
			label: 'String Property',
			origin: Types.PatternPropertyOrigin.UserProvided,
			propertyName: 'stringProperty',
			required: false,
			...mixins
		};
	}

	public static from(serialized: Types.SerializedPatternStringProperty): PatternStringProperty {
		return new PatternStringProperty({
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

	public static fromDefaults(
		mixins?: Partial<PatternPropertyInit<string>>
	): PatternStringProperty {
		return new PatternStringProperty(PatternStringProperty.Defaults(mixins));
	}

	public coerceValue(value: unknown): string | undefined {
		if (typeof value === 'string') {
			return value;
		}

		const empty = this.required ? '' : undefined;

		if (typeof value === 'undefined' || value === null) {
			return empty;
		}

		if (typeof value === 'number' && !Number.isNaN(value)) {
			return String(value);
		}

		if (typeof value === 'boolean') {
			return value ? 'true' : 'false';
		}

		return empty;
	}

	public toJSON(): Types.SerializedPatternStringProperty {
		return {
			model: this.model,
			contextId: this.contextId,
			defaultValue: this.defaultValue,
			description: this.description,
			example: this.example || '',
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

	public update(prop: PatternStringProperty): void {
		this.contextId = prop.getContextId();
		this.description = prop.getDescription();
		this.defaultValue = prop.getDefaultValue();
		this.example = prop.getExample();
		this.group = prop.getGroup();
		this.hidden = prop.getHidden();
		this.label = prop.getLabel();
		this.propertyName = prop.getPropertyName();
		this.required = prop.getRequired();
	}
}
