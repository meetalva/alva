import { PatternPropertyBase } from './property-base';
import * as Types from '@meetalva/types';

export class PatternAssetProperty extends PatternPropertyBase<string | undefined> {
	public readonly type = Types.PatternPropertyType.Asset;

	public static from(serialized: Types.SerializedPatternAssetProperty): PatternAssetProperty {
		return new PatternAssetProperty({
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
		if (typeof value === 'string') {
			return value;
		}

		return undefined;
	}

	public toJSON(): Types.SerializedPatternAssetProperty {
		return {
			model: this.model,
			contextId: this.contextId,
			control: this.control,
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

	public update(prop: PatternAssetProperty): void {
		this.contextId = prop.getContextId();
		this.control = prop.getControl();
		this.defaultValue = prop.getDefaultValue();
		this.description = prop.getDescription();
		this.group = prop.getGroup();
		this.hidden = prop.getHidden();
		this.label = prop.getLabel();
		this.propertyName = prop.getPropertyName();
		this.required = prop.getRequired();
	}
}
