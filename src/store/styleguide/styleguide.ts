import { Directory } from '../../styleguide-analyzer/directory';
import { PatternFolder } from './folder';
import * as PathUtils from 'path';
import { Pattern } from './pattern';
import { StringProperty } from './property/string-property';
import { StyleguideAnalyzer } from '../../styleguide-analyzer/styleguide-analyzer';

/**
 * The styleguide is the component library the current Alva space bases on.
 * It consists of a set of patterns the page element themselves base on.
 * To resolve what patterns are contained in the styleguide (and what properties they do support),
 * styleguide analyzer parse the source or built files of each pattern.
 * Styleguide analyzers vary for different languages (e.g. TypeScript, JavaScript)
 * and frontend frameworks (e.g. React, Angular, Vue).
 * @see Pattern
 * @see PageElement
 * @see StyleguideAnalyzer
 */
export class Styleguide {
	/**
	 * The analyzer active in this styleguide. The actual one depends on the type of styleguide.
	 * The analyzers detects patterns (and pattern folders) it finds to the list of styleguide patterns.
	 */
	private readonly analyzer?: StyleguideAnalyzer;

	/**
	 * The root folder of the patterns of the currently opened styleguide.
	 */
	private patternRoot: PatternFolder;

	/**
	 * The global pattern registry, a lookup of all pattern by their IDs.
	 */
	private patterns: Map<string, Pattern> = new Map();

	/**
	 * The absolute and OS-specific path to the styleguide top-level folders.
	 * This is where all pattern implementations are located.
	 */
	private readonly path: string;

	/**
	 * Creates a new styleguide. Then loads the styleguide's patterns using the configured styleguide analyzer.
	 * @param path The absolute and OS-specific path to the styleguide top-level folders.
	 * This is where all pattern implementations are located.
	 * @param analyzerName The name of the analyzer active in this styleguide. The actual one depends on the type of styleguide.
	 * The analyzers detects patterns (and pattern folders) it finds to the list of styleguide patterns.
	 */
	public constructor(path: string, analyzerName: string) {
		this.path = path || '';

		const Analyzer = require(`../../styleguide-analyzer/${analyzerName}/${analyzerName}`)
			.Analyzer;
		this.analyzer = new Analyzer();

		const patternsDir = new Directory(this.getPatternsPath());
		this.patternRoot = new PatternFolder(patternsDir.getName());

		this.addSyntheticPatterns();

		if (this.analyzer) {
			this.analyzer.analyze(this);
		}
	}

	/**
	 * Adds a new pattern to the styleguide. Call this method from the styleguide analyzer.
	 * Note that you can optionally also call addPattern on one or more pattern folders to organize patterns, but you always have to add it to the styleguide.
	 * @param pattern The pattern to add.
	 */
	public addPattern(pattern: Pattern): void {
		this.patterns.set(pattern.getId(), pattern);
	}

	/**
	 * Adds Alva's synthetic patterns to this styleguide. Synthetic patterns do not have a physical implementation. They are required to create page elements that represent values only, such as child text nodes.
	 */
	private addSyntheticPatterns(): void {
		const textPattern = new Pattern(Pattern.SYNTHETIC_TEXT_ID, 'text', '');
		const textProperty = new StringProperty(StringProperty.SYNTHETIC_TEXT_ID);
		textPattern.addProperty(textProperty);

		const folder = new PatternFolder('synthetic', this.patternRoot);
		folder.addPattern(textPattern);

		this.addPattern(textPattern);
	}

	/**
	 * Returns the analyzer active in this styleguide. The actual one depends on the type of styleguide.
	 * The analyzers detects patterns (and pattern folders) it finds to the list of styleguide patterns.
	 * @return The analyzer active in this styleguide.
	 */
	public getAnalyzer(): StyleguideAnalyzer | undefined {
		return this.analyzer;
	}

	/**
	 * Returns the path of the root folder of the designs (projects, pages)
	 * in the currently opened styleguide.
	 * @return The page root path.
	 */
	public getPagesPath(): string {
		return PathUtils.join(this.path, 'alva');
	}

	/**
	 * Returns the absolute and OS-specific path to the styleguide top-level directories.
	 * This is where the projects, pages, and the pattern implementations are located.
	 * @return The root path of the styleguide.
	 */
	public getPath(): string {
		return this.path;
	}

	/**
	 * Returns the path of the root folder of the built patterns (like atoms, modules etc.)
	 * in the currently opened styleguide.
	 * @return The patterns root path.
	 */
	public getPatternsPath(): string {
		return PathUtils.join(this.path, 'lib', 'patterns');
	}

	/**
	 * Returns a parsed pattern information object for a given pattern ID.
	 * @param id The ID of the pattern. It's local to the styleguide analyzer that detected the pattern.
	 * How this is generated is completely up to the styleguide analyzer that creates the pattern.
	 * @return The resolved pattern, or undefined, if no such ID exists.
	 */
	public getPattern(id: string): Pattern | undefined {
		return this.patterns.get(id);
	}

	/**
	 * Returns the root folder of the patterns of the currently opened styleguide.
	 * @return The root folder object.
	 */
	public getPatternRoot(): PatternFolder {
		return this.patternRoot;
	}
}
