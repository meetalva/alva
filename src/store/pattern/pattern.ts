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
 * Depending on the StyleguideAnalyzer used, various styleguide formats are supported,
 * e.g. Patternplate.
 */
export class Pattern {
	/**
	 * The ID of the pattern. It's local to the StyleguideAnalyzer that detected the pattern.
	 * How this is generated is completely up to the StyleguideAnalyzer that creates the pattern.
	 */
	protected id: string;

	/**
	 * The StyleguideAnalyzer that detected the pattern.
	 */
	protected analyzer: StyleguideAnalyzer;

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
	 * The absolute path to the icon of the pattern, if provided by the implementation.
	 */
	protected iconPath: string | undefined;

	public constructor(init: PatternInit) {
		this.name = Store.guessName(init.name);
		this.id = init.id;
		this.analyzer = init.analyzer;
	}

	/**
	 * Returns the ID of the pattern. It's local to the StyleguideAnalyzer that detected the pattern.
	 * How this is generated is completely up to the StyleguideAnalyzer that creates the pattern.
	 * @return The ID of the pattern.
	 */
	public getId(): string {
		return this.id;
	}

	/**
	 * Returns the StyleguideAnalyzer that detected the pattern.
	 * @return The StyleguideAnalyzer that detected the pattern.
	 */
	public getAnalyzer(): StyleguideAnalyzer {
		return this.analyzer;
	}

	/**
	 * Returns the type of the pattern (eg.: react, vue...)
	 * @return The type of the pattern (eg.: react, vue...)
	 */
	public getType(): PatternType {
		return this.analyzer.getPatternType();
	}

	/**
	 * Returns the absolute path to the icon of the pattern, if provided by the implementation.
	 * @return The absolute path to the icon of the pattern.
	 */
	public getIconPath(): string | undefined {
		return this.iconPath;
	}

	public setIconPath(iconPath: string | undefined): void {
		this.iconPath = iconPath;
	}

	/**
	 * Returns the human-readable name of the pattern.
	 * In the frontend, to be displayed instead of the ID.
	 * @return The human-readable name of the pattern.
	 */
	public getName(): string {
		return this.name;
	}

	public setName(name: string): void {
		this.name = name;
	}

	/**
	 * Returns the properties this pattern supports.
	 * @return The properties this pattern supports.
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
