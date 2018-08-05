import { deserializeOrigin, PatternPropertyBase, serializeOrigin } from './property-base';
import * as Types from '../../types';

export class PatternHrefProperty extends PatternPropertyBase<string | undefined> {
	public readonly type = Types.PatternPropertyType.Href;

	public static from(serialized: Types.SerializedHrefProperty): PatternHrefProperty {
		return new PatternHrefProperty({
			contextId: serialized.contextId,
			defaultValue: serialized.defaultValue,
			description: serialized.description,
			example: serialized.example,
			hidden: serialized.hidden,
			id: serialized.id,
			inputType: serialized.inputType,
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

	public toJSON(): Types.SerializedHrefProperty {
		return {
			model: this.model,
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

	public update(raw: PatternHrefProperty | Types.SerializedHrefProperty): void {
		const prop = raw instanceof PatternHrefProperty ? raw : PatternHrefProperty.from(raw);
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
