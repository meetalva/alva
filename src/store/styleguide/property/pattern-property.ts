import { Pattern } from '../pattern';
import { Property } from './property';

/**
 * A pattern property is a property that supports objects with nested values,
 * but these objects represent the props of another, nested pattern.
 * In a React component implementation, the props' property is of JSX.Element type.
 * When rendering the component is automatically instantiated using the object values.
 * @see Property
 * @see PatternProperty
 */
export class PatternProperty extends Property {
	/**
	 * The pattern values of this property belong to.
	 */
	private pattern: Pattern;

	/**
	 * Creates a new pattern property.
	 * @param id The technical ID of this property (e.g. the property name
	 * in the TypeScript props interface).
	 */
	public constructor(id: string) {
		super(id);
	}

	/**
	 * @inheritdoc
	 */
	// tslint:disable-next-line:no-any
	public async coerceValue(value: any): Promise<any> {
		// Page elements coerce their properties themselves
		return value;
	}

	/**
	 * Returns the pattern values of this property belong to.
	 * @return The pattern values of this property belong to.
	 */
	public getPattern(): Pattern {
		return this.pattern;
	}

	/**
	 * @inheritdoc
	 */
	public getType(): string {
		return 'pattern';
	}

	/**
	 * Sets the pattern values of this property belong to.<br>
	 * <b>Note:</b> This method should only be called from the pattern parsers.
	 * @param pattern The pattern values of this property belong to.
	 */
	public setPattern(pattern: Pattern): void {
		this.pattern = pattern;
	}

	/**
	 * @inheritdoc
	 */
	public toString(): string {
		return `PatternProperty(${super.toString()})`;
	}
}
