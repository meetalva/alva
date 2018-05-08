import * as AlvaUtil from '../../alva-util';
import { PatternFolder } from './folder';
import * as Property from './property';
import { Slot } from './slot';
import { Styleguide } from './styleguide';
import * as Types from '../types';
import * as uuid from 'uuid';

export type PatternType = SyntheticPatternType | ConcretePatternType;

export enum SyntheticPatternType {
	SyntheticPage = 'synthetic:page',
	SyntheticPlaceholder = 'synthetic:placeholder',
	SyntheticText = 'synthetic:text'
}

export enum ConcretePatternType {
	Pattern = 'pattern'
}

export interface PatternInit {
	exportName?: string;
	id?: string;
	name: string;
	path: string;
	properties?: Property.Property[];
	slots?: Slot[];
	type: PatternType;
}

export interface PatternContext {
	styleguide: Styleguide;
}

/**
 * A pattern represents a reusable, styled component (e.g. a React component) of the styleguide.
 * Patterns are parsed from the lib folder of the styleguide, supporting a set of properties
 * of various types, like strings, numbers, page elements, etc.
 * The designer then creates page elements within a page using these patterns as a basis.
 * Patterns may be structured into folders (like 'atoms', 'modules', etc.).
 * Depending on the styleguide analyzer used, various styleguide formats are supported,
 * e.g. Patternplate.
 */
export class Pattern {
	/**
	 * The ID of the default slot.
	 */
	public static DEFAULT_SLOT_PROPERTY_NAME: string = 'default';

	/**
	 * The name of the export in the JavaScript implementation of the pattern.
	 * For default export, the value is 'default'.
	 */
	private exportName: string;

	/**
	 * The folder containing the pattern.
	 */
	private folder: PatternFolder;

	/**
	 * The ID of the pattern. How this is generated is completely up to the styleguide analyzer
	 * that creates the pattern (and does not necessarily represent the file path).
	 */
	private id: string;

	/**
	 * The human-readable name of the pattern.
	 * In the frontend, to be displayed instead of the ID.
	 */
	private name: string;

	/**
	 * The absolute path to the JavaScript implementation of the pattern,
	 * used to preview page elements.
	 */
	private path: string;

	/**
	 * The properties this pattern supports.
	 */
	private properties: Property.Property[];

	/**
	 * The slots this pattern supports
	 */
	private slots: Slot[];

	private type: PatternType;

	/**
	 * Creates a new pattern.
	 * @param id The ID of the pattern. How this is generated is completely up to the styleguide analyzer
	 * that creates the pattern (and does not necessarily represent the file path).
	 * @param name The human-readable name of the pattern.
	 * @param implementationPath The absolute path to the JavaScript implementation of the pattern,
	 * used to preview page elements.
	 * @param exportName The name of the export in the JavaScript implementation of the pattern.
	 * For default export, the value is 'default'.
	 */
	public constructor(init: PatternInit) {
		this.id = init.id || uuid.v4();
		this.name = AlvaUtil.guessName(init.name);
		this.path = init.path || '';
		this.exportName = init.exportName || 'default';
		this.type = init.type;
		this.properties = init.properties || [];
		this.slots = init.slots || [new Slot({ id: 'default', name: AlvaUtil.guessName('default') })];
	}

	public static from(serializedPattern: Types.SerializedPattern): Pattern {
		return new Pattern({
			exportName: serializedPattern.exportName,
			id: serializedPattern.id,
			name: serializedPattern.name,
			path: serializedPattern.path,
			properties: serializedPattern.properties.map(unserializeProperty),
			slots: serializedPattern.slots.map(slot => Slot.from(slot)),
			type: stringToType(serializedPattern.type)
		});
	}

	public static fromTypeString(type: string, context: PatternContext): Pattern {
		return context.styleguide.getPatternById(type) as Pattern;
	}

	/**
	 * Adds a property to this pattern. This method is called by the pattern parser only.
	 * @param property The new property to add.
	 */
	public addProperty(property: Property.Property): void {
		this.properties.push(property);
	}

	/**
	 * Adds a slot to this pattern. This method is called by the analyzer only.
	 * @param name The slot to add.
	 */
	public addSlot(slot: Slot): void {
		this.slots.push(slot);
	}

	/**
	 * Returns the name of the export in the JavaScript implementation of the pattern.
	 * For default export, the value is 'default'.
	 * @return The name of the export.
	 */
	public getExportName(): string {
		return this.exportName;
	}

	public getFolder(): PatternFolder {
		return this.folder;
	}

	/**
	 * Returns the ID of the pattern. How this is generated is completely up to the
	 * styleguide analyzer that creates the pattern (and does not necessarily represent
	 * the file path).
	 * @return The ID of the pattern.
	 */
	public getId(): string {
		return this.id;
	}

	/**
	 * Returns the human-readable name of the pattern.
	 * In the frontend, to be displayed instead of the ID.
	 * @return The human-readable name of the pattern.
	 */
	public getName(): string {
		return this.name;
	}

	public getPath(): string {
		return this.path;
	}

	/**
	 * Returns the properties this pattern supports.
	 * @return The properties this pattern supports.
	 */
	public getProperties(): Property.Property[] {
		return this.properties;
	}

	/**
	 * Returns a property this pattern supports, by its ID.
	 * @param id The ID of the property.
	 * @param path If the property you are trying to find is buried inside an object property use the path paremeter to find it.
	 * eg: `getProperty('image', 'src.srcSet')`.
	 * @return The property for the given ID, if it exists.
	 */
	public getProperty(id: string, path?: string): Property.Property | undefined {
		let property = this.properties.find(p => p.getId() === id);

		if (!property || !path) {
			return property;
		}

		for (const part of path.split('.')) {
			if (property && property.type === Property.PropertyType.Object) {
				property = (property as Property.ObjectProperty).getProperty(part);
			} else {
				return;
			}
		}

		return property;
	}

	/**
	 * Returns the slots this pattern supports.
	 * @return The slots this pattern supports.
	 */
	public getSlots(): Slot[] {
		return this.slots;
	}

	public getType(): PatternType {
		return this.type;
	}

	public toJSON(): Types.SerializedPattern {
		return {
			exportName: this.exportName,
			id: this.id,
			name: this.name,
			path: this.path,
			slots: this.slots.map(slot => slot.toJSON()),
			type: this.type,
			properties: this.properties.map(property => property.toJSON())
		};
	}
}

const stringToType = (input: string): PatternType => {
	switch (input) {
		case 'synthetic:page':
			return SyntheticPatternType.SyntheticPage;
		case 'synthetic:placeholder':
			return SyntheticPatternType.SyntheticPlaceholder;
		case 'synthetic:text':
			return SyntheticPatternType.SyntheticText;
		case 'pattern':
		default:
			return ConcretePatternType.Pattern;
	}
};

const unserializeProperty = (serialized: Types.SerializedProperty): Property.Property => {
	switch (serialized.type) {
		case Types.PropertyType.Asset:
			return Property.AssetProperty.from(serialized);
		case Types.PropertyType.Boolean:
			return Property.BooleanProperty.from(serialized);
		case Types.PropertyType.Enum:
			return Property.EnumProperty.from(serialized);
		case Types.PropertyType.Number:
			return Property.NumberProperty.from(serialized);
		case Types.PropertyType.NumberArray:
			return Property.NumberArrayProperty.from(serialized);
		case Types.PropertyType.Object:
			return Property.ObjectProperty.from(serialized);
		case Types.PropertyType.String:
			return Property.StringProperty.from(serialized);
		case Types.PropertyType.StringArray:
			return Property.StringArrayProperty.from(serialized);
	}
};
