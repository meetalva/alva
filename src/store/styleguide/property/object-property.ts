import { Property } from './property';

/**
 * An object property is a property that supports objects with nested property values.
 * The properties field declares the types of each object element.
 * When rendering, the objects are used as-is for the props' property.
 * @see Property
 * @see PatternProperty
 */
export class ObjectProperty extends Property {
	/**
	 * The nested properties this property supports in its object values.
	 */
	private properties: Map<string, Property> = new Map();

	/**
	 * Creates a new object property.
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
		if (value === null || value === undefined || value === '') {
			return undefined;
		}

		return value;
	}

	/**
	 * Returns the nested properties this property supports in its object values.
	 * @return The nested properties this property supports.
	 */
	public getProperties(): Property[] {
		return Array.from(this.properties.values());
	}

	/**
	 * Returns a nested property for a given property ID.
	 * @param id The ID of the property to return.
	 * @return The nested property if the ID was found.
	 */
	public getProperty(id: string): Property | undefined {
		return this.properties.get(id);
	}

	/**
	 * @inheritdoc
	 */
	public getType(): string {
		return 'object';
	}

	/**
	 * Sets The nested properties this property supports in its object values.<br>
	 * <b>Note:</b> This method should only be called from the pattern parsers.
	 * @param properties The nested properties this property supports.
	 */
	public setProperties(properties: Property[]): void {
		this.properties = new Map();
		for (const property of properties) {
			this.properties.set(property.getId(), property);
		}
	}

	/**
	 * @inheritdoc
	 */
	public toString(): string {
		return `ObjectProperty(${super.toString()})`;
	}
}
