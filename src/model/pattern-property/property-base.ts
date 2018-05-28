// TODO: Disband this file in favor of a pure interface
// that can be implemented by properties. Also consider
// splitting array vs enum vs object vs primitive properties
import * as Types from '../types';
import * as uuid from 'uuid';

export { PatternPropertyType } from '../types';

export interface PatternPropertyInit<T> {
	defaultValue?: T;
	hidden?: boolean;
	id?: string;
	label: string;
	propertyName: string;
	required?: boolean;
}

/**
 * A property is the meta-information about one styleguide pattern component property
 * (props interface), such as its name and type. Read by the pattern parsers and provided to build
 * the property editing pane.
 * Page elements contain the actual values for each property.
 * @see PageElement
 * @see PatternParser
 */
export abstract class PatternPropertyBase<T> {
	protected defaultValue: T;

	protected hidden: boolean = false;

	protected id: string;

	protected label: string;

	protected propertyName: string;

	protected required: boolean = false;

	public readonly type: Types.PatternPropertyType;

	public constructor(init: PatternPropertyInit<T>) {
		this.id = init.id || uuid.v4();
		this.label = init.label;
		this.propertyName = init.propertyName;

		if (typeof init.hidden !== 'undefined') {
			this.hidden = init.hidden;
		}

		if (typeof init.required !== 'undefined') {
			this.required = init.required;
		}

		this.defaultValue = this.coerceValue(init.defaultValue);
	}

	/**
	 * Returns whether two given values are arrays and their content is the same (shallow equal).
	 * @param value1 The first array candidate.
	 * @param value2 The first array candidate.
	 */
	// tslint:disable-next-line:no-any
	protected arraysAndEqual(value1: any, value2: any): boolean {
		if (!(value1 instanceof Array) || !(value2 instanceof Array)) {
			return false;
		}

		// tslint:disable-next-line:no-any
		const array1: any[] = value1;
		// tslint:disable-next-line:no-any
		const array2: any[] = value2;
		if (array1.length !== array2.length) {
			return false;
		}

		for (let i = 0; i < array1.length; i++) {
			if (array1[i] !== array2[i]) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Tries to convert a given value of any type, maybe array, into an array with elements
	 * of a required type, using a given coercion function.
	 * E.g., for boolean properties, "true" and ["true"] are coerced into [true].
	 * See Property sub-classes documentation for a description of allowed raw values
	 * and their conversion.
	 * @param value The raw value, maybe an array.
	 * @param elementCoercion The coercion function.
	 * @return The resulting, property-compatible array.
	 */
	// tslint:disable-next-line:no-any
	protected coerceArrayValue(value: any, elementCoercion: (value: any) => any): any {
		// tslint:disable-next-line:no-any
		let result: any[];
		if (value instanceof Array) {
			result = value;
		} else {
			result = [value];
		}

		// tslint:disable-next-line:no-any
		result = value.filter(
			// tslint:disable-next-line:no-any
			(element: any) => value !== null && value !== undefined && value !== ''
		);

		// tslint:disable-next-line:no-any
		result = result.map(elementCoercion);

		// Ensure that unmodified arrays stay the same
		return this.arraysAndEqual(value, result) ? value : result;
	}

	/**
	 * Tries to convert a given value of any type into the required type of a property.
	 * E.g., for boolean properties, "true" is coerced into true.
	 * See Property sub-classes documentation for a description of allowed raw values
	 * and their conversion.
	 * @param value The raw value.
	 * @param callback A callback to be called with the resulting, property-compatible value.
	 */
	// tslint:disable-next-line:no-any
	public abstract coerceValue(value: any): T;

	/**
	 * Converts a given value into the form required by the component's props' property.
	 * Usually, this is the current value itself, but sometimes, e.g. for enums,
	 * it requires a conversion.
	 * @param value The original value.
	 * @return The value compatible to the component's props' property.
	 */
	// tslint:disable-next-line:no-any
	public convertToRender(value: any): T {
		return value;
	}

	/**
	 * Returns the default value of the property when creating a new page element.
	 * This is the Alva default (such as "Lorem Ipsum"), not the default for production component
	 * instantiation (where such defaults sometimes do not make sense).
	 * @return The default value.
	 */
	public getDefaultValue(): T | undefined {
		return this.defaultValue;
	}

	public getHidden(): boolean {
		return this.hidden;
	}

	/**
	 * Returns the technical ID of this property (e.g. the property name in the TypeScript props
	 * interface).
	 * @return The technical ID.
	 */
	public getId(): string {
		return this.id;
	}

	/**
	 * Returns the human-friendly name of the property, usually provided by an annotation.
	 * In the frontend, to be displayed instead of the ID.
	 * @return The human-friendly name of the property.
	 */
	public getLabel(): string {
		return this.label;
	}

	public getRequired(): boolean {
		return this.required;
	}

	public getType(): Types.PatternPropertyType {
		return this.type;
	}

	public abstract toJSON(): Types.SerializedPatternProperty;
}
