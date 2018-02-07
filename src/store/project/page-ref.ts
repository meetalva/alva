import { JsonObject } from '../json';
import * as MobX from 'mobx';
import { Project } from './project';

/**
 * A page reference consists of the ID and name of a page,
 * without containing the page elements themselves.
 * The store can load the page from its YAML file when required (open page).
 * A page reference (like a page) belongs to exactly one project, and each project
 * belongs to exactly one styleguide (styleguide Alva folder > projects > pages).
 * @see Page
 */
export class PageRef {
	/**
	 * The technical (internal) ID of the page.
	 */
	@MobX.observable private id: string;

	/**
	 * The human-friendly name of the page.
	 * In the frontend, to be displayed instead of the ID.
	 */
	@MobX.observable private name: string;

	/**
	 * The project this page belongs to. May be undefined.
	 */
	@MobX.observable private project?: Project;

	/**
	 * Creates a new page.
	 * @param id The technical (internal) ID of the page.
	 * @param name The human-friendly name of the page.
	 * @param project TThe project this page belongs to. May be undefined.
	 */
	public constructor(id: string, name: string, project?: Project) {
		this.id = id;
		this.name = name;
		this.setProject(project);
	}

	/**
	 * Loads and returns a page reference from a given JSON object.
	 * @param jsonObject The JSON object to load from.
	 * @return A new page reference object containing the loaded data.
	 */
	public static fromJsonObject(json: JsonObject, project: Project): PageRef {
		return new PageRef(json.id as string, json.name as string, project);
	}

	/**
	 * Returns the technical (internal) ID of the page.
	 * @return The technical (internal) ID of the page.
	 */
	public getId(): string {
		return this.id;
	}

	public setId(id: string): void {
		this.id = id;
	}

	/**
	 * Returns the human-friendly name of the page.
	 * In the frontend, to be displayed instead of the ID.
	 * @return The human-friendly name of the page.
	 */
	public getName(): string {
		return this.name;
	}

	/**
	 * Sets the name of the page.
	 * In the frontend, to be displayed instead of the ID.
	 */
	public setName(name: string): void {
		this.name = name;
	}

	/**
	 * Returns the project this page belongs to. May be undefined.
	 * @return The project this page belongs to or undefined.
	 */
	public getProject(): Project | undefined {
		return this.project;
	}

	/**
	 * Removes this page from its project.
	 */
	public remove(): void {
		this.setProject(undefined);
	}

	/**
	 * Sets the project this page belongs to.
	 * If it belonged to a project before, it is removed from that project.
	 * @param project The new project for this page.
	 * May be undefined, in that case the page does not belong to any project anymore.
	 */
	public setProject(project?: Project): void {
		if (this.project) {
			this.project.getPagesInternal().remove(this);
		}

		this.project = project;

		if (project) {
			project.getPagesInternal().push(this);
		}
	}

	/**
	 * Serializes the page reference into a JSON object for persistence.
	 * @return The JSON object to be persisted.
	 */
	public toJsonObject(): JsonObject {
		return {
			id: this.id,
			name: this.name
		};
	}
}
