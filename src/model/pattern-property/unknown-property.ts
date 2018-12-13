import * as JSON5 from 'json5';
import { PatternPropertyBase } from './property-base';
import * as Types from '../../types';

export interface PatternUnknownPropertyInit {
	contextId: string;
	defaultValue?: unknown;
	example?: string;
	description?: string;
	group: string;
	hidden: boolean;
	id: string;
	inputType: Types.PatternPropertyInputType;
	label: string;
	propertyName: string;
	required: boolean;
	typeText: string;
}

export class PatternUnknownProperty extends PatternPropertyBase<unknown | undefined> {
	public readonly typeText: string;
	public readonly type = Types.PatternPropertyType.Unknown;

	public constructor(init: PatternUnknownPropertyInit) {
		super(init);
		this.typeText = init.typeText;
	}

	public static from(serialized: Types.SerializedPatternUnknownProperty): PatternUnknownProperty {
		return new PatternUnknownProperty({
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
			required: serialized.required,
			typeText: serialized.typeText
		});
	}

	public coerceValue(value: any): string | undefined {
		if (typeof value === 'undefined') {
			return;
		}

		try {
			return JSON5.parse(value);
		} catch (err) {
			return;
		}
	}

	public toJSON(): Types.SerializedPatternUnknownProperty {
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
			propertyName: this.propertyName,
			required: this.required,
			type: this.type,
			typeText: this.typeText
		};
	}

	public update(prop: PatternUnknownProperty): void {
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
