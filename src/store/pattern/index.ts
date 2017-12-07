import { PatternFolder } from './folder';
import { PatternParser } from './parser';
import * as PathUtils from 'path';
import { Property } from './property';
import { TypeScriptParser } from './parser/typescript_parser';

export class Pattern {
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
	private properties: Map<string, Property> = new Map();

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
		return Array.from(this.properties.values());
	}

	public getProperty(id: string): Property | undefined {
		return this.properties.get(id);
	}

	public getRelativePath(): string {
		return PathUtils.join(this.folder.getRelativePath(), this.name);
	}

	public isValid(): boolean {
		return this.valid;
	}

	public reload(): void {
		const parsers: PatternParser[] = [new TypeScriptParser()];

		this.valid = false;
		this.properties.clear();
		parsers.some(parser => {
			const result: Property[] | undefined = parser.parse(this);
			if (result) {
				result.forEach(property => {
					this.properties.set(property.getId(), property);
				});

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
