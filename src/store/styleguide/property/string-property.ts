import { Property, PropertyType } from './property';
import * as Types from '../../types';

/**
 * A string property is a property that supports text only.
 * As designer content value (raw value), the string property accepts
 * numbers, undefined, and null, as well (see coerceValue()),
 * but everything is converted into a proper string (never undefined or null).
 * @see Property
 */
export class StringProperty extends Property {
	/**
	 * The ID of the synthetic string property in the synthetic text content pattern.
	 */
	public static SYNTHETIC_TEXT_ID: string = 'text';

	public readonly type = PropertyType.String;

	/**
	 * @inheritdoc
	 */
	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		if (value === null || value === undefined || value === '') {
			return '';
		} else {
			return String(value);
		}
	}
}
