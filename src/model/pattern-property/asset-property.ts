import { deserializeOrigin, PatternPropertyBase, serializeOrigin } from './property-base';
import * as Types from '../types';

export class PatternAssetProperty extends PatternPropertyBase<string | undefined> {
	public readonly type = Types.PatternPropertyType.Asset;

	public static from(serialized: Types.SerializedPatternAssetProperty): PatternAssetProperty {
		return new PatternAssetProperty({
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

	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		if (typeof value === 'string') {
			return value;
		}

		return undefined;
	}

	public toJSON(): Types.SerializedPatternAssetProperty {
		return {
			contextId: this.contextId,
			description: this.description,
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

	public update(prop: PatternAssetProperty): void {
		this.contextId = prop.getContextId();
		this.label = prop.getLabel();
		this.propertyName = prop.getPropertyName();
		this.hidden = prop.getHidden();
		this.required = prop.getRequired();
		this.defaultValue = prop.getDefaultValue();
	}
}
