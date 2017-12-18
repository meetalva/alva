import { PatternFolder } from './folder';
import { PatternParser } from './parser';
import * as PathUtils from 'path';
import { Property } from './property';
import { TypeScriptParser } from './parser/typescript_parser';

export class Pattern {
	/**
	 * The ID of the pattern (also the folder name within the parent folder).
	 */
	protected id: string;

	/**
	 * The parent folder containing the pattern folder.
	 */
	protected folder: PatternFolder;

	/**
	 * The human-readable name of the pattern.
	 */
	protected name: string;

	/**
	 * The absolute icon of the pattern.
	 */
	protected iconPath?: string;

	/**
	 * The properties this pattern supports.
	 */
	protected properties: Map<string, Property> = new Map();

	/**
	 * This is a valid pattern for Alva (has been parsed successfully).
	 */
	protected valid: boolean = false;

	public constructor(folder: PatternFolder, id: string, name: string) {
		this.folder = folder;
		this.id = id;
		this.name = name;

		this.reload();
	}

	public addProperty(property: Property): void {
		this.properties.set(property.getId(), property);
	}

	public getAbsolutePath(): string {
		return PathUtils.join(this.folder.getAbsolutePath(), this.id);
	}

	public getId(): string {
		return this.id;
	}

	public getFolder(): PatternFolder {
		return this.folder;
	}

	public getIconPath(): string | undefined {
		return this.iconPath;
	}

	public getName(): string {
		return this.name;
	}

	public getProperties(): Property[] {
		return Array.from(this.properties.values());
	}

	public getProperty(id: string): Property | undefined {
		return this.properties.get(id);
	}

	public getRelativePath(): string {
		return PathUtils.join(this.folder.getRelativePath(), this.id);
	}

	public isValid(): boolean {
		return this.valid;
	}

	public matches(term: string): boolean {
		if (!term || !this.name) {
			return false;
		}
		return this.name.toLowerCase().indexOf(term.toLowerCase()) >= 0;
	}

	public reload(): void {
		const parsers: PatternParser[] = [new TypeScriptParser()];

		this.valid = false;
		this.properties.clear();
		parsers.forEach(parser => {
			if (parser.parse(this)) {
				this.valid = true;
			}
		});
		Array.from(this.properties.keys()).forEach((propertyId: string) => {
			if ((this.properties.get(propertyId) as Property).isHidden()) {
				this.properties.delete(propertyId);
			}
		});

		if (this.valid) {
			console.debug(`Successfully parsed pattern "${this.getRelativePath()}", properties:`);
			this.properties.forEach(property => {
				console.debug(property.toString());
			});
			console.debug('');
		} else {
			console.warn(
				`Failed to parse pattern "${this.getRelativePath()}":` +
					' Currently we support TypeScript patterns only' +
					' (we require an index.js and an index.d.ts).'
			);
		}
	}

	public setIconPath(iconPath?: string): void {
		this.iconPath = iconPath;
	}

	public setName(name: string): void {
		this.name = name;
	}

	public toString(): string {
		const path = this.getRelativePath();
		return `Pattern(id="${this.id}", path="${path}", properties="${this.properties}")`;
	}
}
