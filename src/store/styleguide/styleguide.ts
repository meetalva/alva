import { AssetProperty } from './property/asset-property';
import { PatternFolder } from './folder';
import { Pattern, SyntheticPatternType } from './pattern';
import { StringProperty } from './property/string-property';
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
	id?: string;
	patterns?: Pattern[];
	root?: PatternFolder;
}

export class Styleguide {
	private id: string;
	private patterns: Pattern[] = [];
	private root: PatternFolder;

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
		this.id = init.id || uuid.v4();
		this.root = init.root || new PatternFolder({ name: 'root' });

		if (init.patterns) {
			this.patterns = init.patterns;
		} else {
			const syntheticFolder = new PatternFolder({
				name: 'synthetic',
				parent: this.root
			});

			this.patterns = [
				new Pattern({
					name: 'page',
					path: '',
					type: SyntheticPatternType.SyntheticPage
				}),
				new Pattern({
					name: 'placeholder',
					path: '',
					type: SyntheticPatternType.SyntheticPlaceholder,
					properties: [
						new AssetProperty({
							name: 'src',
							id: AssetProperty.SYNTHETIC_ASSET_ID
						})
					]
				}),
				new Pattern({
					name: 'text',
					path: '',
					type: SyntheticPatternType.SyntheticText,
					properties: [
						new StringProperty({
							name: 'text',
							id: StringProperty.SYNTHETIC_TEXT_ID
						})
					]
				})
			];

			syntheticFolder.addPattern(this.patterns[1]);
			syntheticFolder.addPattern(this.patterns[2]);
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
		return new Styleguide({});
	}

	public static from(serializedStyleguide: Types.SerializedStyleguide): Styleguide {
		return new Styleguide({
			id: serializedStyleguide.id,
			patterns: serializedStyleguide.patterns.map(pattern => Pattern.from(pattern)),
			root: PatternFolder.from(serializedStyleguide.root)
		});
	}

	public addPattern(pattern: Pattern): void {
		this.patterns.push(pattern);
	}

	public getPatternById(id: string): Pattern | undefined {
		return this.patterns.find(pattern => pattern.getId() === id);
	}

	public getPatternByType(type: SyntheticPatternType): Pattern {
		return this.patterns.find(pattern => pattern.getType() === type) as Pattern;
	}

	public getPatterns(): Pattern[] {
		return this.patterns;
	}

	public getRoot(): PatternFolder {
		return this.root;
	}

	public toJSON(): Types.SerializedStyleguide {
		return {
			id: this.id,
			patterns: this.patterns.map(p => p.toJSON()),
			root: this.root.toJSON()
		};
	}
}
