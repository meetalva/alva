import { PatternFolder } from './folder';
import * as PathUtils from 'path';
import { PatternParser } from './parser/pattern-parser';
import { Property } from './property/property';
import { Store } from '../../store/store';
import { TypeScriptParser } from './parser/typescript-parser';

/**
 * A pattern represents a reusable, styled component (e.g. a React component) of the styleguide.
 * Patterns are parsed from the lib folder of the styleguide, supporting a set of properties
 * of various types, like strings, numbers, page elements, etc.
 * The designer then creates page elements within a page using these patterns as a basis.
 * Patterns may be structured into folders (like 'atoms', 'modules', etc.).
 * Depending on the pattern parser used, various styleguide formats are supported,
 * e.g. Patternplate.
 */
export class Pattern {
	/**
	 * The parent folder containing the pattern folder.
	 */
	protected folder: PatternFolder;

	/**
	 * The ID of the pattern (also the folder name within the parent folder).
	 */
	protected id: string;

	/**
	 * The absolute path to the icon of the pattern, if provided by the implementation.
	 */
	protected iconPath?: string;

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
	 * This is a valid pattern for Alva (has been parsed successfully).
	 */
	protected valid: boolean = false;

	/**
	 * Creates a new pattern.
	 * @param folder The parent folder containing the pattern folder.
	 * @param id The ID of the pattern (also the folder name within the parent folder).
	 * @param name The human-readable name of the pattern.
	 */
	public constructor(folder: PatternFolder, id: string, name?: string) {
		this.folder = folder;
		this.id = id;
		this.name = Store.guessName(id, name);

		this.reload();
	}

	/**
	 * Adds a property to this pattern. This method is called by the pattern parser only.
	 * @param property The new property to add.
	 */
	public addProperty(property: Property): void {
		this.properties.set(property.getId(), property);
	}

	/**
	 * Returns the absolute and OS-dependent file-system path to the folder containing
	 * the built pattern files.
	 * @return The absolute source path.
	 */
	public getAbsolutePath(): string {
		return PathUtils.join(this.folder.getAbsolutePath(), this.id);
	}

	/**
	 * Returns the absolute and OS-dependent file-system path to the folder containing
	 * the pattern source files.
	 * @return The absolute source path.
	 */
	public getAbsoluteSourcePath(): string {
		return PathUtils.join(this.folder.getAbsoluteSourcePath(), this.id);
	}

	/**
	 * Returns the parent folder containing the pattern folder.
	 * @return The parent folder containing the pattern folder.
	 */
	public getFolder(): PatternFolder {
		return this.folder;
	}

	/**
	 * Returns the absolute path to the icon of the pattern, if provided by the implementation.
	 * @return The absolute path to the icon of the pattern.
	 */
	public getIconPath(): string | undefined {
		return this.iconPath;
	}

	/**
	 * Returns the ID of the pattern (also the folder name within the parent folder).
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
	 * @return The property for the given ID, if it exists.
	 */
	public getProperty(id: string): Property | undefined {
		return this.properties.get(id);
	}

	/**
	 * Returns the OS-dependent file-system path to the folder containing
	 * the built pattern sources, relative to the styleguide's pattern folder.
	 * @return The relative path;
	 */
	public getRelativePath(): string {
		return PathUtils.join(this.folder.getRelativePath(), this.id);
	}

	/**
	 * Returns whether the pattern parsers decided that the pattern is compatible to Alva.
	 * Internal flag used while parsing. The list of pattern of a folder always contains valid
	 * patterns only, so no need to check in the components.
	 * @return Whether the pattern is valid for Alva.
	 */
	public isValid(): boolean {
		return this.valid;
	}

	/**
	 * Returns whether this pattern matches a given search string.
	 * @param term The search string as provided by the user.
	 * @return Whether the pattern matches the string.
	 */
	public matches(term: string): boolean {
		if (!term || !this.name) {
			return false;
		}
		return this.name.toLowerCase().indexOf(term.toLowerCase()) >= 0;
	}

	/**
	 * Loads (or reloads) this pattern from its implemetation.
	 * This methods delegates to all registered pattern parsers to read all meta-information
	 * provided, parsing name, ID, properties, etc. of the pattern.
	 * All parsers may contribute to the final pattern information.
	 */
	public reload(): void {
		const parsers: PatternParser[] = [new TypeScriptParser()];

		this.valid = false;
		this.properties.clear();
		parsers.forEach(parser => {
			if (parser.parse(this)) {
				this.valid = true;
			}
		});
		Array.from(this.properties.keys()).forEach((propertyId: string) => {
			if ((this.properties.get(propertyId) as Property).isHidden()) {
				this.properties.delete(propertyId);
			}
		});

		if (this.valid) {
			console.debug(`Successfully parsed pattern "${this.getRelativePath()}", properties:`);
			this.properties.forEach(property => {
				console.debug(property.toString());
			});
			console.debug('');
		} else {
			console.warn(
				`Failed to parse pattern "${this.getRelativePath()}":` +
					' Currently we support TypeScript patterns only' +
					' (we require an index.js and an index.d.ts).'
			);
		}
	}

	/**
	 * Sets the absolute path to the icon of the pattern.
	 * This method is called by any pattern parser implementation to enrich meta-information.
	 * @param iconPath The absolute path to the icon of the pattern.
	 */
	public setIconPath(iconPath?: string): void {
		this.iconPath = iconPath;
	}

	/**
	 * Sets the human-readable name of the pattern.
	 * This method is called by any pattern parser implementation to enrich meta-information.
	 * @param name Sets the human-readable name of the pattern.
	 */
	public setName(name: string): void {
		this.name = name;
	}

	/**
	 * Returns a string representation of this pattern.
	 * @return The string representation.
	 */
	public toString(): string {
		const path = this.getRelativePath();
		return `Pattern(id="${this.id}", path="${path}", properties="${this.properties}")`;
	}
}
