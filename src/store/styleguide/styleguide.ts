import { AssetProperty } from './property/asset-property';
import { Directory } from '../../styleguide/analyzer/directory';
import { PatternFolder } from './folder';
import { Pattern } from './pattern';
import { StringProperty } from './property/string-property';
import { StyleguideAnalyzer } from '../../styleguide/analyzer/styleguide-analyzer';

export enum SyntheticPatternType {
	Page = 'synthetic:page',
	Placeholder = 'synthetic:placeholder',
	Text = 'synthetic:text'
}

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
	 * The analyzers detects patterns (and pattern folders) it finds to the list of styleguide
	 * patterns.
	 */
	private readonly analyzer?: StyleguideAnalyzer;

	/**
	 * The absolute and OS-specific path to the styleguide top-level folders.
	 * This is where all pattern implementations are located.
	 */
	private readonly path: string;

	/**
	 * The root folder of the patterns of the currently opened styleguide.
	 */
	private patternRoot: PatternFolder;

	/**
	 * The global pattern registry, a lookup of all pattern by their IDs.
	 */
	private patterns: Map<string, Pattern> = new Map();

	/**
	 * The path of the root folder of the built patterns (like atoms, modules etc.)
	 * in the currently opened styleguide.
	 */
	private patternsPath: string;

	/**
	 * Creates a new styleguide. Then loads the styleguide's patterns using the configured
	 * styleguide analyzer.
	 * @param path The absolute and OS-specific path to the styleguide top-level folders.
	 * This is where all pattern implementations are located.
	 * @param patternsPath The path of the root folder of the built patterns (like atoms,
	 * modules etc.) in the currently opened styleguide.
	 * @param analyzerName The name of the analyzer active in this styleguide. The actual one
	 * depends on the type of styleguide. The analyzers detects patterns (and pattern folders)
	 * it finds to the list of styleguide patterns.
	 */
	public constructor(path: string, patternsPath: string, analyzerName: string) {
		this.path = path;
		this.patternsPath = patternsPath;

		const Analyzer = require(`../../styleguide/analyzer/${analyzerName}/${analyzerName}`)
			.Analyzer;
		this.analyzer = new Analyzer();

		const patternsDir = new Directory(this.getPatternsPath());
		this.patternRoot = new PatternFolder(patternsDir.getName());

		const folder = new PatternFolder('synthetic', this.patternRoot);

		const pagePattern = new Pattern(SyntheticPatternType.Page, 'Page', '');
		this.addPattern(pagePattern);

		const textPattern = new Pattern(SyntheticPatternType.Text, 'Text', '');
		textPattern.addProperty(new StringProperty(StringProperty.SYNTHETIC_TEXT_ID));
		folder.addPattern(textPattern);
		this.addPattern(textPattern);

		const assetPattern = new Pattern(SyntheticPatternType.Placeholder, 'Placeholder', '');
		assetPattern.addProperty(new AssetProperty(AssetProperty.SYNTHETIC_ASSET_ID));
		folder.addPattern(assetPattern);
		this.addPattern(assetPattern);

		if (this.analyzer) {
			this.analyzer.analyze(this);
		}
	}

	/**
	 * Adds a new pattern to the styleguide. Call this method from the styleguide analyzer.
	 * Note that you can optionally also call addPattern on one or more pattern folders to organize
	 * patterns, but you always have to add it to the styleguide.
	 * @param pattern The pattern to add.
	 */
	public addPattern(pattern: Pattern): void {
		this.patterns.set(pattern.getId(), pattern);
	}

	/**
	 * Returns the analyzer active in this styleguide. The actual one depends on the type of
	 * styleguide. The analyzers detects patterns (and pattern folders) it finds to the list of
	 * styleguide patterns.
	 * @return The analyzer active in this styleguide.
	 */
	public getAnalyzer(): StyleguideAnalyzer | undefined {
		return this.analyzer;
	}

	/**
	 * Returns the absolute and OS-specific path to the styleguide top-level directories.
	 * This is where the projects, pages, and the pattern implementations are located.
	 * @return The absolute and OS-specific root path of the styleguide.
	 */
	public getPath(): string {
		return this.path;
	}

	/**
	 * Returns a parsed pattern information object for a given pattern ID.
	 * @param id The ID of the pattern. It's local to the styleguide analyzer that detected the
	 * pattern. How this is generated is completely up to the styleguide analyzer that creates the
	 * pattern.
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

	/**
	 * Returns all known (parsed) pattern informations.
	 * @return All known (parsed) pattern informations.
	 */
	public getPatterns(): Pattern[] {
		return Array.from(this.patterns.values());
	}

	/**
	 * Returns the absolute and OS-specific path of the root folder of the built patterns
	 * (like atoms, modules etc.) in the currently opened styleguide.
	 * @return The absolute and OS-specific patterns root path.
	 */
	public getPatternsPath(): string {
		return this.patternsPath;
	}

	/**
	 * Returns a parsed pattern information object for a given pattern ID.
	 * @param type The type of the synthetic pattern.
	 * @return The resolved pattern
	 */
	public getSyntheticPattern(type: SyntheticPatternType): Pattern {
		return this.patterns.get(type) as Pattern;
	}
}
