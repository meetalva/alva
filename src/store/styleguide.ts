import { Pattern, PatternFolder, SyntheticPatternType } from './pattern';
import * as PatternProperty from './pattern-property';
import * as Types from './types';
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
				name: 'Synthetic',
				parent: this.root
			});

			const page = new Pattern({
				name: 'Page',
				path: '',
				type: SyntheticPatternType.SyntheticPage
			});

			const placeholder = new Pattern({
				name: 'Placeholder',
				path: '',
				type: SyntheticPatternType.SyntheticPlaceholder,
				properties: [
					new PatternProperty.PatternAssetProperty({
						label: 'Source',
						propertyName: 'src'
					})
				]
			});

			const text = new Pattern({
				name: 'Text',
				path: '',
				type: SyntheticPatternType.SyntheticText,
				properties: [
					new PatternProperty.StringPatternProperty({
						label: 'Text',
						propertyName: 'text'
					})
				]
			});

			this.patterns = [page, placeholder, text];

			syntheticFolder.addPattern(placeholder);
			syntheticFolder.addPattern(text);
		}
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
