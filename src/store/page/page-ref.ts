import { JsonObject } from '../json';
import * as MobX from 'mobx';
import { Project } from '../project';
import { Store } from '../store';
import * as Uuid from 'uuid';

export interface PageRefProperties {
	id?: string;
	name?: string;
	path?: string;
	project: Project;
}

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
	@MobX.observable private id?: string;

	/**
	 * The last path reference persisted in the projects.xml for this page. Used:
	 * 1) to save the page elements file before saving the alva.yaml.
	 * 2) to rename existing page elements files when saving the alva.yaml.
	 */
	@MobX.observable private lastPersistedPath?: string;

	/**
	 * The human-friendly name of the page.
	 * In the frontend, to be displayed instead of the ID.
	 */
	@MobX.observable private name?: string;

	/**
	 * The path of the page file, relative to the alva.yaml.
	 */
	@MobX.observable private path: string;

	/**
	 * The project this page belongs to.
	 */
	@MobX.observable private project: Project;

	/**
	 * Creates a new page.
	 * @param path The path of the page file, relative to the alva.yaml.
	 * @param name The human-friendly name of the page.
	 * @param project The project this page belongs to.
	 */
	public constructor(properties: PageRefProperties) {
		this.id = properties.id ? properties.id : Uuid.v4();
		this.setProject(properties.project);

		if (properties.path) {
			this.path = properties.path;
			this.lastPersistedPath = this.path;
		} else {
			this.updatePathFromNames();
		}

		this.name = Store.guessName(this.id, properties.name);
	}

	/**
	 * Loads and returns a page reference from a given JSON object.
	 * @param jsonObject The JSON object to load from.
	 * @return A new page reference object containing the loaded data.
	 */
	public static fromJsonObject(json: JsonObject, project: Project): PageRef {
		if (json.uuid) {
			return new PageRef({
				id: json.uuid as string,
				path: json.path as string,
				name: json.name as string,
				project
			});
		} else if (json.id) {
			// Migrate from previous alva.yaml version
			const path = `./page-${json.id}.yaml`;
			const pageRef = new PageRef({ path, name: json.name as string, project });
			pageRef.updatePathFromNames();
			return pageRef;
		} else {
			throw new Error(
				"Invalid page file reference in alva.yaml: Either 'id' or 'uuid' are required"
			);
		}
	}

	/**
	 * Returns the technical (internal) ID of the page.
	 * @return The technical (internal) ID of the page.
	 */
	public getId(): string {
		return this.id || Uuid.v4();
	}

	/**
	 * Returns the last path reference persisted in the projects.xml for this page. Used:
	 * 1) to save the page elements file before saving the alva.yaml.
	 * 2) to rename existing page elements files when saving the alva.yaml.
	 * @return The last path reference persisted in the projects.xml.
	 */
	public getLastPersistedPath(): string | undefined {
		return this.lastPersistedPath;
	}

	/**
	 * Returns the human-friendly name of the page.
	 * In the frontend, to be displayed instead of the ID.
	 * @return The human-friendly name of the page.
	 */
	public getName(): string {
		return this.name || 'Unnamed Page';
	}

	/**
	 * Returns the path of the page file, relative to the alva.yaml.
	 * @return the path of the page file.
	 */
	public getPath(): string {
		return this.path;
	}

	/**
	 * Returns the project this page belongs to.
	 * @return The project this page belongs to.
	 */
	public getProject(): Project {
		return this.project;
	}

	/**
	 * Sets the human-friendly name of the page.
	 * @param name The human-friendly name of the page.
	 */
	public setName(name: string): void {
		this.name = name;
	}

	/**
	 * Sets the path of the page file, relative to the alva.yaml.
	 * @param path The path of the page file.
	 */
	public setPath(path: string): void {
		this.path = path;
	}

	/**
	 * Sets the project this page belongs to.
	 * If it belonged to a project before, it is removed from that project.
	 * @param project The new project for this page.
	 */
	public setProject(project: Project): void {
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
			uuid: this.id,
			name: this.name,
			path: this.path
		};
	}

	/**
	 * Updates the last persisted path from the path properties.
	 * Call this method after saving the alva.yaml.
	 */
	public updateLastPersistedPath(): void {
		this.lastPersistedPath = this.path;
	}

	/**
	 * Updates the path of the page file from the project and page names, trying to use normalized
	 * versions of those names, and then finding the next unused file name.
	 */
	public updatePathFromNames(): void {
		this.path = Store.getInstance().findAvailablePagePath(this);
	}
}
