import * as MobX from 'mobx';
import * as Types from './types';
import * as username from 'username';
import * as Uuid from 'uuid';
import { Page, Styleguide } from '.';

export interface ProjectProperties {
	id?: string;
	lastChangedAuthor?: string;
	lastChangedDate?: Date;
	name: string;
	pages: Page[];
	styleguide: Styleguide;
}

export interface ProjectCreateInit {
	name: string;
}

/**
 * A project is the grouping unit for pages, and directly located below the styleguide designs
 * (styleguide Alva folder > projects > pages). Each page belongs to exactly one project,
 * and each project belongs to exactly one styleguide.
 * Projects do not contain the page elements directly.
 * Instead, they know what pages exist (page references),
 * and the store can load them from YAML files when required (open page).
 */
export class Project {
	/**
	 * The technical (internal) ID of the project.
	 */
	@MobX.observable private id: string;

	/**
	 * The last author who edited this project or one of its pages (including elements,
	 * properties etc.). Updated when calling the touch method.
	 * @see touch()
	 */
	@MobX.observable private lastChangedAuthor: string;

	/**
	 * The last change date when this project or one of its pages was edited (including elements,
	 * properties etc.). Updated when calling the touch method.
	 * @see touch()
	 */
	@MobX.observable private lastChangedDate: Date = new Date();

	/**
	 * The human-friendly name of the project.
	 * In the frontend, to be displayed instead of the ID.
	 */
	@MobX.observable private name: string;

	/**
	 * The page references of the project. Projects do not contain the page elements directly.
	 * Instead, they know what pages exist (page references),
	 * and the store can load them from YAML files when required (open page).
	 */
	@MobX.observable private pages: Page[] = [];

	/**
	 * The underlying styleguide for this project
	 */
	@MobX.observable private styleguide: Styleguide;

	/**
	 * Creates a new project.
	 * @param id The technical (internal) ID of the project.
	 * @param name The human-friendly name of the project.
	 */
	public constructor(properties: ProjectProperties) {
		this.styleguide = properties.styleguide;
		this.name = properties.name;

		this.id = properties.id ? properties.id : Uuid.v4();
		this.lastChangedAuthor = properties.lastChangedAuthor || 'unknown';
		this.lastChangedDate = properties.lastChangedDate || new Date();

		this.pages = properties.pages ? properties.pages : [];
	}

	public static create(init: ProjectCreateInit): Project {
		const styleguide = Styleguide.create();

		const page = Page.create({
			styleguide,
			name: init.name
		});

		return new Project({
			name: init.name,
			pages: [page],
			styleguide
		});
	}

	/**
	 * Loads and returns a project from a given JSON object.
	 * @param jsonObject The JSON object to load from.
	 * @return A new project object containing the loaded data.
	 */
	public static from(serializedProject: Types.SerializedProject): Project {
		const styleguide = Styleguide.from(serializedProject.styleguide);

		return new Project({
			id: serializedProject.uuid,
			lastChangedAuthor: serializedProject.lastChangedAuthor,
			lastChangedDate: serializedProject.lastChangedDate
				? new Date(serializedProject.lastChangedDate)
				: undefined,
			name: serializedProject.name,
			pages: serializedProject.pages.map(page => Page.from(page, { styleguide })),
			styleguide
		});
	}

	public addPage(page: Page): void {
		this.pages.push(page);
	}

	/**
	 * Returns the technical (internal) ID of the project.
	 * @return The technical (internal) ID of the project.
	 */
	public getId(): string {
		return this.id;
	}

	/**
	 * The last author who edited this project or one of its pages (including elements,
	 * properties etc.). Updated when calling the touch method.
	 * @see touch()
	 */
	public getLastChangedAuthor(): string {
		return this.lastChangedAuthor;
	}

	/**
	 * The last change date when this project or one of its pages was edited (including elements,
	 * properties etc.). Updated when calling the touch method.
	 * @see touch()
	 */
	public getLastChangedDate(): Date {
		return this.lastChangedDate;
	}

	/**
	 * Returns the human-friendly name of the project.
	 * In the frontend, to be displayed instead of the ID.
	 * @return The human-friendly name of the project.
	 */
	public getName(): string {
		return this.name;
	}

	/**
	 * Returns fully resolved page objects
	 */
	public getPages(): Page[] {
		return this.pages;
	}

	public getStyleguide(): Styleguide {
		return this.styleguide;
	}

	/**
	 * Sets the human-friendly name of the project.
	 * In the frontend, to be displayed instead of the ID.
	 * @param name The human-friendly name of the project.
	 */
	public setName(name: string): void {
		this.name = name;
	}

	/**
	 * Extract serializable object from project.
	 * @return The JSON object
	 */
	public toJSON(): Types.SerializedProject {
		return {
			uuid: this.id,
			name: this.name,
			lastChangedAuthor: this.lastChangedAuthor,
			lastChangedDate: this.lastChangedDate ? this.lastChangedDate.toJSON() : undefined,
			pages: this.pages.map(p => p.toJSON()),
			styleguide: this.styleguide.toJSON()
		};
	}

	/**
	 * Serialize the project into a string for persistence and transfer
	 * @return The JSON string
	 */
	public toString(): string {
		return JSON.stringify(this.toJSON());
	}

	/**
	 * Updates the last-changed date and author. Call this on any page or project user command.
	 */
	public touch(): void {
		void (async () => {
			this.lastChangedAuthor = await username();
			this.lastChangedDate = new Date();
		})();
	}
}
