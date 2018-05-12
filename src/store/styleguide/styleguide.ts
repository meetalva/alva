import { Page } from './page';
import { Pattern, PatternFolder, SyntheticPatternType } from '../pattern';
import { Placeholder } from './placeholder';
import { Text } from './text';
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

	public constructor(init: StyleguideInit) {
		this.id = init.id || uuid.v4();
		this.root = init.root || new PatternFolder({ name: 'root' });

		if (init.patterns) {
			this.patterns = init.patterns;
		} else {
			const syntheticFolder = new PatternFolder({
				name: 'Synthetic',
				parent: this.root
			});

			const placeholder = Placeholder();
			const text = Text();

			this.patterns = [Page(), placeholder, text];

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
