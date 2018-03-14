import { PatternFolder } from './folder';
import { ObjectProperty } from './property/object-property';
import { Property } from './property/property';
import { Store } from '../store';

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
	 * The ID of the synthetic text content pattern.
	 */
	public static SYNTHETIC_TEXT_ID: string = 'synthetic:text';

	/**
	 * The name of the export in the JavaScript implementation of the pattern.
	 * For default export, the value is 'default'.
	 */
	protected exportName: string;

	/**
	 * The folder containing the pattern.
	 */
	protected folder: PatternFolder;

	/**
	 * The absolute path to the icon of the pattern, if provided by the implementation.
	 */
	protected iconPath?: string;

	/**
	 * The ID of the pattern. How this is generated is completely up to the styleguide analyzer
	 * that creates the pattern (and does not necessarily represent the file path).
	 */
	protected id: string;

	/**
	 * The absolute path to the JavaScript implementation of the pattern,
	 * used to preview page elements.
	 */
	protected implementationPath: string;

	/**
	 * The human-readable name of the pattern.
	 * In the frontend, to be displayed instead of the ID.
	 */
	protected name: string;

	/**
	 * The properties this pattern supports.
	 */
	protected properties: Map<string, Property> = new Map();

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
	public constructor(id: string, name: string, implementationPath: string, exportName?: string) {
		this.id = id;
		this.name = Store.guessName(name);
		this.implementationPath = implementationPath || '';
		this.exportName = exportName || 'default';
	}

	/**
	 * Adds a property to this pattern. This method is called by the pattern parser only.
	 * @param property The new property to add.
	 */
	public addProperty(property: Property): void {
		this.properties.set(property.getId(), property);
	}

	/**
	 * Writes information about this pattern to the console.
	 * @param indentation The current indentation level, if invoked from a pattern folder.
	 */
	public dump(indentation: number = 0): void {
		console.log(
			`${'  '.repeat(indentation)}Pattern '${this.id}', path '${this.implementationPath}'`
		);
	}

	/**
	 * Returns the name of the export in the JavaScript implementation of the pattern.
	 * For default export, the value is 'default'.
	 * @return The name of the export.
	 */
	public getExportName(): string {
		return this.exportName;
	}

	/**
	 * Returns the absolute path to the icon of the pattern, if provided by the implementation.
	 * @return The absolute path to the icon of the pattern.
	 */
	public getIconPath(): string | undefined {
		return this.iconPath;
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
	 * Returns the absolute path to the JavaScript implementation of the pattern,
	 * used to preview page elements.
	 * @return The absolute path to the JavaScript implementation.
	 */
	public getImplementationPath(): string {
		return this.implementationPath;
	}

	/**
	 * Returns the human-readable name of the pattern.
	 * In the frontend, to be displayed instead of the ID.
	 * @return The human-readable name of the pattern.
	 */
	public getName(): string {
		return this.name;
	}

	/**
	 * Returns the properties this pattern supports.
	 * @return The properties this pattern supports.
	 */
	public getProperties(): Property[] {
		return Array.from(this.properties.values());
	}

	/**
	 * Returns a property this pattern supports, by its ID.
	 * @param id The ID of the property.
	 * @param path If the property you are trying to find is buried inside an object property use the path paremeter to find it.
	 * eg: `getProperty('image', 'src.srcSet')`.
	 * @return The property for the given ID, if it exists.
	 */
	public getProperty(id: string, path?: string): Property | undefined {
		let property = this.properties.get(id);

		if (!property || !path) {
			return property;
		}

		for (const part of path.split('.')) {
			if (property && property.getType() === 'object') {
				property = (property as ObjectProperty).getProperty(part);
			} else {
				return undefined;
			}
		}

		return property;
	}

	/**
	 * Sets the absolute path to the icon of the pattern.
	 * This method is called by any pattern parser implementation to enrich meta-information.
	 * @param iconPath The absolute path to the icon of the pattern.
	 */
	public setIconPath(iconPath?: string): void {
		this.iconPath = iconPath;
	}
}
