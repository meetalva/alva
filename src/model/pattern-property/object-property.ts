import { PatternPropertyBase, PatternPropertyType } from './property-base';
import * as Types from '../types';

export type PropertyResolver = () => PatternPropertyBase[];

/**
 * An object property is a property that supports objects with nested property values.
 * The properties field declares the types of each object element.
 * When rendering, the objects are used as-is for the props' property.
 * @see Property
 * @see PatternProperty
 */
export class PatternObjectProperty extends PatternPropertyBase {
	/**
	 * The nested properties this property supports in its object values.
	 */
	private properties?: Map<string, PatternPropertyBase>;

	private propertyResolver?: PropertyResolver;

	public readonly type = PatternPropertyType.Object;

	public static from(serialized: Types.SerializedPatternObjectProperty): PatternObjectProperty {
		return new PatternObjectProperty({
			hidden: serialized.hidden,
			defaultValue: serialized.defaultValue,
			id: serialized.id,
			label: serialized.label,
			propertyName: serialized.propertyName,
			required: serialized.required
		});
	}

	/**
	 * @inheritdoc
	 */
	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		if (value === null || value === undefined || value === '') {
			return undefined;
		}

		return value;
	}

	/**
	 * Returns the nested properties this property supports in its object values.
	 * @return The nested properties this property supports.
	 */
	public getProperties(): PatternPropertyBase[] {
		return Array.from(this.resolveProperties().values());
	}

	/**
	 * Returns a nested property for a given property ID.
	 * @param id The ID of the property to return.
	 * @return The nested property if the ID was found.
	 */
	public getProperty(id: string): PatternPropertyBase | undefined {
		return this.resolveProperties().get(id);
	}

	private resolveProperties(): Map<string, PatternPropertyBase> {
		if (!this.properties) {
			if (!this.propertyResolver) {
				throw new Error('property resolver is not set');
			}

			const resolvedProperties = this.propertyResolver();
			const properties = new Map();

			resolvedProperties.forEach(property => properties.set(property.getId(), property));

			this.properties = properties;
		}

		return this.properties;
	}

	/**
	 * Sets The nested properties this property supports in its object values.<br>
	 * <b>Note:</b> This method should only be called from the pattern parsers.
	 * @param properties The nested properties this property supports.
	 */
	public setPropertyResolver(propertyResolver: PropertyResolver): void {
		this.propertyResolver = propertyResolver;
	}

	public toJSON(): Types.SerializedPatternObjectProperty {
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
