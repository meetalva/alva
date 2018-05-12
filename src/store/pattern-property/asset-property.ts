import { PatternProperty, PatternPropertyType } from './property';
import * as Types from '../types';

/**
 * An asset property is a property that takes an uploaded file (e.g. an image)
 * as a data-URL string to output it as src of an img tag or alike.
 * As designer content value (raw value), the asset property accepts data-URL strings and
 * undefined (as empty src) only. All other values are invalid and converted into undefined.
 * To convert a given file, Buffer, or HTTP URL into a data-URL string,
 * use getValueFromFile, getValueFromBuffer, or getValueFromUrl.
 * @see Property
 */
export class PatternAssetProperty extends PatternProperty {
	public readonly type = PatternPropertyType.Asset;

	public static from(serialized: Types.SerializedPatternAssetProperty): PatternAssetProperty {
		return new PatternAssetProperty({
			hidden: serialized.hidden,
			defaultValue: serialized.defaultValue,
			id: serialized.id,
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
			hidden: this.hidden,
			defaultValue: this.defaultValue,
			id: this.id,
			label: this.label,
			propertyName: this.propertyName,
			required: this.required,
			type: this.type
		};
	}
}
