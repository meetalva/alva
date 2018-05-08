import * as Fs from 'fs';
import * as fetch from 'isomorphic-fetch';
import * as MimeTypes from 'mime-types';
import * as Path from 'path';
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
 * @see AssetProperty.getValueFromFile
 * @see AssetProperty.getValueFromBuffer
 * @see AssetProperty.getValueFromUrl
 */
export class AssetProperty extends Property {
	/**
	 * The ID of the synthetic string property in the synthetic asset content pattern.
	 */
	public static SYNTHETIC_ASSET_ID: string = 'asset';

	public readonly type = PropertyType.Asset;
	/**
	 * Converts a given buffer and mime type into a data-URL string, a valid value for this property.
	 * @param buffer The buffer to read.
	 * @param mimeType The mime type of the buffer content.
	 * @return The data-URL string.
	 */
	public static getValueFromBuffer(buffer: Buffer, mimeType: string): string {
		return `data:${mimeType};base64,${buffer.toString('base64')}`;
	}

	/**
	 * Reads a given file and converts it into a data-URL string, a valid value for this property.
	 * @param path The OS-specific path to the file to read.
	 * @return The data-URL string.
	 */
	public static getValueFromFile(path: string): string {
		const fileName: string | undefined = path.split(Path.sep).pop();
		if (fileName === undefined) {
			throw new Error(`Invalid asset path ${path}`);
		}

		const mimeType = MimeTypes.lookup(fileName) || 'application/octet-stream';
		const buffer: Buffer = Fs.readFileSync(path);
		return this.getValueFromBuffer(buffer, mimeType);
	}

	/**
	 * Downloads a given file from HTTP and converts it into a data-URL string,
	 * a valid value for this property.
	 * @param url The URL of the file to download.
	 * @param callback A callback that gets the downloaded file as data-URL.
	 */
	public static async getValueFromUrl(url: string): Promise<string> {
		const response = await fetch(url);
		if (response.status >= 400) {
			throw new Error(`Failed to load file from server: HTTP ${response.status}`);
		}
		if (!response.body) {
			throw new Error('Server returned no content');
		}

		const mimeType = response.headers.get('Content-Type') || 'application/octet-stream';

		// tslint:disable-next-line:no-any
		const buffer: Buffer = await (response as any).buffer();
		return AssetProperty.getValueFromBuffer(buffer, mimeType);
	}

	/**
	 * @inheritdoc
	 */
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
