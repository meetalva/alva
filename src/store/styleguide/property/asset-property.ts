// import * as Fs from 'fs';
// import * as fetch from 'isomorphic-fetch';
// import * as MimeTypes from 'mime-types';
// import * as Path from 'path';
import { Property, PropertyType } from './property';
import * as Types from '../../types';

/**
 * An asset property is a property that takes an uploaded file (e.g. an image)
 * as a data-URL string to output it as src of an img tag or alike.
 * As designer content value (raw value), the asset property accepts data-URL strings and
 * undefined (as empty src) only. All other values are invalid and converted into undefined.
 * To convert a given file, Buffer, or HTTP URL into a data-URL string,
 * use getValueFromFile, getValueFromBuffer, or getValueFromUrl.
 * @see Property
 */
export class AssetProperty extends Property {
	/**
	 * The ID of the synthetic string property in the synthetic asset content pattern.
	 */
	public static SYNTHETIC_ASSET_ID: string = 'asset';

	public readonly type = PropertyType.Asset;

	public static from(serialized: Types.SerializedAssetProperty): AssetProperty {
		return new AssetProperty({
			hidden: serialized.hidden,
			defaultValue: serialized.defaultValue,
			id: serialized.id,
			name: serialized.name,
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

	public from(serializedProperty: Types.SerializedAssetProperty): AssetProperty {
		const property = new AssetProperty({
			hidden: serializedProperty.hidden,
			defaultValue: serializedProperty.defaultValue,
			id: serializedProperty.id,
			name: serializedProperty.name,
			required: serializedProperty.required
		});

		return property;
	}

	public toJSON(): Types.SerializedAssetProperty {
		return {
			hidden: this.hidden,
			defaultValue: this.defaultValue,
			id: this.id,
			name: this.name,
			required: this.required,
			type: this.type
		};
	}
}
