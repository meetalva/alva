import * as Types from '../types';
import * as uuid from 'uuid';

export { PatternPropertyType } from '../types';

export interface PatternPropertyInit {
	// tslint:disable-next-line:no-any
	defaultValue?: any;
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
export abstract class PatternPropertyBase {
	/**
	 * The default value of the property when creating a new page element.
	 * This is the Alva default (such as "Lorem Ipsum"), not the default for production component
	 * instantiation (where such defaults sometimes do not make sense).
	 */
	// tslint:disable-next-line:no-any
	protected defaultValue: any;

	/**
	 * Whether this property is marked as hidden in Alva (exists in the pattern, but the designer
	 * should not provide content for it).
	 */
	protected hidden: boolean = false;

	/**
	 * The technical ID of this property (e.g. the property name in the TypeScript props interface).
	 */
	protected id: string;

	/**
	 * The human-friendly name of the property, usually provided by an annotation.
	 * In the frontend, to be displayed instead of the ID.
	 */
	protected label: string;

	protected propertyName: string;

	/**
	 * Whether the designer, when editing a page element, is required to enter a value
	 * for this property.
	 */
	protected required: boolean = false;

	public readonly type: Types.PatternPropertyType;

	/**
	 * Creates a new property.
	 * @param id The technical ID of this property (e.g. the property name in the TypeScript
	 * props interface). Initially, the name is guessed automatically.
	 */
	public constructor(init: PatternPropertyInit) {
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
	public abstract coerceValue(value: any): any; // TODO: Make this a static, strongly typed method on

	/**
	 * Converts a given value into the form required by the component's props' property.
	 * Usually, this is the current value itself, but sometimes, e.g. for enums,
	 * it requires a conversion.
	 * @param value The original value.
	 * @return The value compatible to the component's props' property.
	 */
	// tslint:disable-next-line:no-any
	public convertToRender(value: any): any {
		return value;
	}

	/**
	 * Returns the default value of the property when creating a new page element.
	 * This is the Alva default (such as "Lorem Ipsum"), not the default for production component
	 * instantiation (where such defaults sometimes do not make sense).
	 * @return The default value.
	 */
	// tslint:disable-next-line:no-any
	public getDefaultValue(): any {
		return this.defaultValue;
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

	public getType(): Types.PatternPropertyType {
		return this.type;
	}

	/**
	 * Returns whether this property is marked as hidden in Alva (exists in the pattern, but the designer
	 * should not provide content for it).
	 * @return Whether this property is hidden in Alva.
	 */
	public isHidden(): boolean {
		return this.hidden;
	}

	/**
	 * Returns whether the designer, when editing a page element, is required to enter a value
	 * for this property.
	 * @return Whether the property is required.
	 */
	public isRequired(): boolean {
		return this.required;
	}

	public abstract toJSON(): Types.SerializedPatternProperty;
}
