import { PatternParser } from './parser';
import * as PathUtils from 'path';
import { PatternFolder } from './pattern_folder';
import { Property } from './property';
import { TypeScriptParser } from './parser/typescript-parser';
import { Store } from '..';

export class Pattern {
	private static parsers: PatternParser[];

	/**
	 * The name of the pattern folder.
	 */
	public name: string;

	/**
	 * The parent folder containing the pattern folder.
	 */
	public folder: PatternFolder;

	/**
	 * The properties this pattern supports.
	 */
	public properties: Property[];

	/**
	 * The application state store.
	 */
	public store: Store;

	/**
	 * This is a valid pattern for Stacked (has been parsed successfully).
	 */
	public valid: boolean = false;

	public constructor(store: Store, folder: PatternFolder, name: string) {
		this.store = store;
		this.folder = folder;
		this.name = name;

		this.refresh();
	}

	public refresh(): void {
		if (!Pattern.parsers) {
			Pattern.parsers = [new TypeScriptParser()];
		}

		if (Pattern.parsers.some(parser => parser.parse(this))) {
			this.valid = true;
		} else {
			this.valid = false;
			console.warn(
				`Failed to parse pattern "${this.getStyleguideRelativePath()}":` +
					' Currently we support TypeScript patterns only' +
					' (we require an index.js and an index.d.ts).'
			);
		}
	}

	public getPath(): string {
		return PathUtils.join(this.folder.getPath(), this.name);
	}

	public getStyleguideRelativePath(): string {
		return PathUtils.join(this.folder.getStyleguideRelativePath(), this.name);
	}

	public toString(): string {
		const path = this.getStyleguideRelativePath();
		return `Pattern(name="${this.name}", path="${path}", properties="${this.properties}")`;
	}
}
