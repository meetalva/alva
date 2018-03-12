import { Directory } from '../../styleguide-analyzer/directory';
import { PatternFolder } from './folder';
import { Pattern } from './pattern';
import { PatternType } from './pattern-type';
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
	 * The root folder of the patterns of the currently opened styleguide.
	 */
	private patterns: Map<string, Pattern> = new Map();

	private readonly path: string;

	public constructor(path?: string, analyzer?: StyleguideAnalyzer) {
		this.path = path || '';
		this.analyzer = analyzer;
	}

	public addPattern(pattern: Pattern): void {
		this.patterns.set(pattern.getId(), pattern);
	}

	private addSyntheticPatterns(): void {
		const textPattern = new Pattern('text', 'text', PatternType.SYNTHETIC, 'synthetic');
		const textProperty = new StringProperty('text');
		textPattern.addProperty(textProperty);

		const folder = new PatternFolder('synthetic', this.patternRoot);
		folder.addPattern(textPattern);

		this.addPattern(textPattern);
	}

	public getAnalyzer(): StyleguideAnalyzer | undefined {
		return this.analyzer;
	}

	public getPath(): string {
		return this.path;
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
	public getPatternRoot(): PatternFolder | undefined {
		return this.patternRoot;
	}

	public load(): void {
		const rootDir = new Directory(this.path);
		this.patternRoot = new PatternFolder(rootDir.getName());

		this.addSyntheticPatterns();

		if (this.analyzer) {
			this.analyzer.analyze(this);
		}
	}
}
