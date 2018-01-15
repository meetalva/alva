import { PatternType } from './pattern-type';
import { Property } from './property/property';
import { Store } from '../store';
import { StyleguideAnalyzer } from '../styleguide/styleguide-analyzer';

export interface PatternInit {
	id: string;
	name: string;
	analyzer: StyleguideAnalyzer;
}

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
	protected id: string;
	protected analyzer: StyleguideAnalyzer;
	protected name: string;
	protected properties: Map<string, Property> = new Map();
	protected iconPath: string | undefined;

	public constructor(init: PatternInit) {
		this.name = Store.guessName(init.name);
		this.id = init.id;
		this.analyzer = init.analyzer;
	}

	/**
	 * The ID of the pattern (also the folder name within the parent folder).
	 */
	public getId(): string {
		return this.id;
	}

	/** The StylguideAnalyzer the pattern emerged from. */
	public getAnalyzer(): StyleguideAnalyzer {
		return this.analyzer;
	}

	/**
	 * The type of the pattern (eg.: react, vue...)
	 */
	public getType(): PatternType {
		return this.analyzer.getPatternType();
	}

	/**
	 * The absolute path to the icon of the pattern, if provided by the implementation.
	 */
	public getIconPath(): string | undefined {
		return this.iconPath;
	}

	public setIconPath(iconPath: string | undefined): void {
		this.iconPath = iconPath;
	}

	/**
	 * The human-readable name of the pattern.
	 * In the frontend, to be displayed instead of the ID.
	 */
	public getName(): string {
		return this.name;
	}

	public setName(name: string): void {
		this.name = name;
	}

	/**
	 * The properties this pattern supports.
	 */
	public getProperties(): Map<string, Property> {
		return this.properties;
	}

	public setProperties(properties: Map<string, Property>): void {
		this.properties = properties;
	}

	/**
	 * Returns a property this pattern supports, by its ID.
	 * @param id The ID of the property.
	 * @return The property for the given ID, if it exists.
	 */
	public getProperty(id: string): Property | undefined {
		return this.getProperties().get(id);
	}
}
