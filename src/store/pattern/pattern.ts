import { PatternFolder } from './folder';
import * as PathUtils from 'path';
import { PatternParser } from './parser/pattern_parser';
import { Property } from './property/property';
import { Store } from '../../store/store';
import { TypeScriptParser } from './parser/typescript_parser';

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
	 * The ID of the pattern (also the folder name within the parent folder).
	 */
	protected id: string;

	/**
	 * The parent folder containing the pattern folder.
	 */
	protected folder: PatternFolder;

	/**
	 * The human-readable name of the pattern.
	 */
	protected name: string;

	/**
	 * The absolute icon of the pattern.
	 */
	protected iconPath?: string;

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
	 * the built pattern sources.
	 * @return The absolute path;
	 */
	public getAbsolutePath(): string {
		return PathUtils.join(this.folder.getAbsolutePath(), this.id);
	}

	public getId(): string {
		return this.id;
	}

	public getFolder(): PatternFolder {
		return this.folder;
	}

	public getIconPath(): string | undefined {
		return this.iconPath;
	}

	public getName(): string {
		return this.name;
	}

	public getProperties(): Property[] {
		return Array.from(this.properties.values());
	}

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

	public isValid(): boolean {
		return this.valid;
	}

	public matches(term: string): boolean {
		if (!term || !this.name) {
			return false;
		}
		return this.name.toLowerCase().indexOf(term.toLowerCase()) >= 0;
	}

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

	public setIconPath(iconPath?: string): void {
		this.iconPath = iconPath;
	}

	public setName(name: string): void {
		this.name = name;
	}

	public toString(): string {
		const path = this.getRelativePath();
		return `Pattern(id="${this.id}", path="${path}", properties="${this.properties}")`;
	}
}
