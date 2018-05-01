import { JsonArray, JsonObject } from './json';
import * as MobX from 'mobx';
import { PageRef } from './page/page-ref';
import { Store } from './store';
import * as username from 'username';
import * as Uuid from 'uuid';

export interface ProjectProperties {
	id?: string;
	lastChangedAuthor?: string;
	lastChangedDate?: Date;
	name: string;
	previewFrame: string;
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
	@MobX.observable private pages: PageRef[] = [];

	/**
	 * Path to the preview frame, relative to the alva.yaml file.
	 */
	@MobX.observable private previewFrame: string;

	/**
	 * Creates a new project.
	 * @param id The technical (internal) ID of the project.
	 * @param name The human-friendly name of the project.
	 * @param previewFrame Path to the preview frame, relative to the alva.yaml file.
	 */
	public constructor(properties: ProjectProperties) {
		this.id = properties.id ? properties.id : Uuid.v4();
		this.name = properties.name;
		this.lastChangedAuthor = properties.lastChangedAuthor || 'unknown';
		this.lastChangedDate = properties.lastChangedDate || new Date();
		this.previewFrame = properties.previewFrame;
	}

	/**
	 * Loads and returns a project from a given JSON object.
	 * @param jsonObject The JSON object to load from.
	 * @return A new project object containing the loaded data.
	 */
	public static fromJsonObject(json: JsonObject): Project {
		const lastChangedDate = new Date(json.lastChangedDate as string);

		const project: Project = new Project({
			id: json.uuid as string,
			name: json.name as string,
			lastChangedAuthor: json.lastChangedAuthor as string | undefined,
			lastChangedDate: isNaN(lastChangedDate.getTime()) ? undefined : lastChangedDate,
			previewFrame: json.previewFrame as string
		});

		const pages: PageRef[] = [];
		(json.pages as JsonArray).forEach((pageJson: JsonObject) => {
			pages.push(PageRef.fromJsonObject(pageJson, project));
		});

		return project;
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
	 * The page references of the project. Projects do not contain the page elements directly.
	 * Instead, they know what pages exist (page references),
	 * and the store can load them from YAML files when required (open page).
	 */
	public getPages(): PageRef[] {
		return this.pages;
	}

	/**
	 * Internal method to get the pages as a MobX observable.
	 * Do not use from the UI components.
	 * @return The internal pages representation.
	 */
	public getPagesInternal(): MobX.IObservableArray<PageRef> {
		return this.pages as MobX.IObservableArray<PageRef>;
	}

	/**
	 * Returns the configured path to the preview frame, relative to the alva.yaml file.
	 * @return Path to the configured preview frame
	 */
	public getPreviewFrame(): string {
		return this.previewFrame;
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
	 * Serializes the project into a JSON object for persistence.
	 * @return The JSON object to be persisted.
	 */
	public toJsonObject(): JsonObject {
		return {
			uuid: this.id,
			name: this.name,
			lastChangedAuthor: this.lastChangedAuthor,
			lastChangedDate: this.lastChangedDate ? this.lastChangedDate.toJSON() : undefined,
			previewFrame: this.previewFrame,
			pages: this.pages.map(p => p.toJsonObject())
		};
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

	/**
	 * Updates the path of each project's page file from the project and page names, trying to use
	 * normalized versions of those names, and then finding the next unused file name.
	 */
	public updatePathFromNames(): void {
		this.pages.forEach(project => Store.getInstance().findAvailablePagePath(project));
	}
}
