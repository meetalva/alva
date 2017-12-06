import { PatternFolder } from './folder';
import { PatternParser } from './parser';
import * as PathUtils from 'path';
import { Property } from './property';
import { TypeScriptParser } from './parser/typescript_parser';

export class Pattern {
	private static parsers: PatternParser[];

	/**
	 * The name of the pattern folder.
	 */
	private name: string;

	/**
	 * The parent folder containing the pattern folder.
	 */
	private folder: PatternFolder;

	/**
	 * The properties this pattern supports.
	 */
	private properties: Property[];

	/**
	 * This is a valid pattern for Stacked (has been parsed successfully).
	 */
	private valid: boolean = false;

	public constructor(folder: PatternFolder, name: string) {
		this.folder = folder;
		this.name = name;

		this.reload();
	}

	public getAbsolutePath(): string {
		return PathUtils.join(this.folder.getAbsolutePath(), this.name);
	}

	public getName(): string {
		return this.name;
	}

	public getFolder(): PatternFolder {
		return this.folder;
	}

	public getProperties(): Property[] {
		return this.properties;
	}

	public getRelativePath(): string {
		return PathUtils.join(this.folder.getRelativePath(), this.name);
	}

	public isValid(): boolean {
		return this.valid;
	}

	public reload(): void {
		if (!Pattern.parsers) {
			Pattern.parsers = [new TypeScriptParser()];
		}

		this.valid = false;
		this.properties = [];
		Pattern.parsers.some(parser => {
			const result: Property[] | undefined = parser.parse(this);
			if (result) {
				this.properties = result;
				this.valid = true;
				return true;
			} else {
				return false;
			}
		});

		if (!this.valid) {
			console.warn(
				`Failed to parse pattern "${this.getRelativePath()}":` +
					' Currently we support TypeScript patterns only' +
					' (we require an index.js and an index.d.ts).'
			);
		}
	}

	public toString(): string {
		const path = this.getRelativePath();
		return `Pattern(name="${this.name}", path="${path}", properties="${this.properties}")`;
	}
}
