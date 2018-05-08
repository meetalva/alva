// import { AssetProperty } from './property/asset-property';
// import { Directory } from '../../styleguide/analyzer/directory';
// import { PatternFolder } from './folder';
import { Pattern, SyntheticPatternType } from './pattern';
// import { StringProperty } from './property/string-property';
// import { StyleguideAnalyzer } from '../../styleguide/analyzer/styleguide-analyzer';
import * as Types from '../types';
import * as uuid from 'uuid';

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

export interface StyleguideInit {
	id: string;
	patterns?: Pattern[];
}

export class Styleguide {
	private id: string;
	private patterns: Pattern[] = [];

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
	public constructor(
		init: StyleguideInit /* path: string, patternsPath: string, analyzerName: string*/
	) {
		if (init.patterns) {
			this.patterns = init.patterns;
		} else {
			this.patterns = [
				new Pattern({
					name: 'page',
					path: '',
					type: SyntheticPatternType.SyntheticPage
				}),
				new Pattern({
					name: 'placeholder',
					path: '',
					type: SyntheticPatternType.SyntheticPlaceholder
				}),
				new Pattern({
					name: 'text',
					path: '',
					type: SyntheticPatternType.SyntheticText
				})
			];
		}

		/* this.path = path;
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
		} */
	}

	public static create(): Styleguide {
		return new Styleguide({
			id: uuid.v4()
		});
	}

	public static from(serializedStyleguide: Types.SerializedStyleguide): Styleguide {
		return new Styleguide({
			id: serializedStyleguide.id,
			patterns: serializedStyleguide.patterns.map(pattern => Pattern.from(pattern))
		});
	}

	/**
	 * Adds a new pattern to the styleguide. Call this method from the styleguide analyzer.
	 * Note that you can optionally also call addPattern on one or more pattern folders to organize
	 * patterns, but you always have to add it to the styleguide.
	 * @param pattern The pattern to add.
	 */
	public addPattern(pattern: Pattern): void {
		this.patterns.push(pattern);
	}

	/**
	 * Returns a parsed pattern information object for a given pattern ID.
	 * @param id The ID of the pattern. It's local to the styleguide analyzer that detected the
	 * pattern. How this is generated is completely up to the styleguide analyzer that creates the
	 * pattern.
	 * @return The resolved pattern, or undefined, if no such ID exists.
	 */
	public getPattern(id: string): Pattern | undefined {
		return this.patterns.find(pattern => pattern.getId() === id);
	}

	public getPatternByType(type: SyntheticPatternType): Pattern {
		return this.patterns.find(pattern => pattern.getType() === type) as Pattern;
	}

	/**
	 * Returns all known (parsed) pattern informations.
	 * @return All known (parsed) pattern informations.
	 */
	public getPatterns(): Pattern[] {
		return Array.from(this.patterns.values());
	}

	public toJSON(): Types.SerializedStyleguide {
		return {
			id: this.id,
			patterns: this.patterns.map(p => p.toJSON())
		};
	}
}
