import { JsonObject } from '../json';
import * as MobX from 'mobx';
import { PageElement } from './page-element';
import { Store } from '../store';

/**
 * The current actually loaded page of a project. It consists of a tree of page elements,
 * which in turn provide the properties data for the pattern components.
 * @see PageRef
 */
export class Page {
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
	 * The root element of the page, the first pattern element of the content tree.
	 */
	private root?: PageElement;

	/**
	 * Creates a new page.
	 * @param id The technical (internal) ID of the page.
	 * @param store The global application store.
	 */
	public constructor(id: string, store: Store) {
		this.id = id;
		this.name = 'New Page';
	}

	/**
	 * Loads and returns a page from a given JSON object.
	 * @param jsonObject The JSON object to load from.
	 * @return A new page object containing the loaded data.
	 */
	public static fromJsonObject(json: JsonObject, id: string, store: Store): Page {
		const page = new Page(id, store);
		page.name = json.name as string;
		page.root = PageElement.fromJsonObject(json.root as JsonObject, store);

		return page;
	}

	/**
	 * Returns the technical (internal) ID of the page.
	 * @return The technical (internal) ID of the page.
	 */
	public getId(): string {
		return this.id;
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
	 * Returns the root element of the page, the first pattern element of the content tree.
	 * @return The root element of the page.
	 */
	public getRoot(): PageElement | undefined {
		return this.root;
	}

	/*
	* Sets the technical (internal) ID of the page.
	*/
	public setId(id: string): void {
		this.id = id;
	}

	/**
	 * Sets the human-friendly name of the page.
	 */
	public setName(name: string): void {
		this.name = name;
	}

	/**
	 * Serializes the page into a JSON object for persistence.
	 * @return The JSON object to be persisted.
	 */
	public toJsonObject(): JsonObject {
		return { name: this.name, root: this.root ? this.root.toJsonObject() : undefined };
	}
}
