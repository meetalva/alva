import { JsonObject } from '../json';
import * as MobX from 'mobx';
import { PageElement } from './page_element';
import { Store } from '../store';

export class Page {
	/**
	 * The technical (internal) ID of the page.
	 */
	@MobX.observable private id: string;

	/**
	 * The human-friendly name of the page.
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
	 * @return The human-friendly name of the page.
	 */
	public getName(): string {
		return this.name;
	}

	/**
	 * Returns the root element of the page, the first pattern element of the content tree.
	 * @return The root element of the page.
	 */
	public getRoot(): PageElement {
		return this.root as PageElement;
	}

	/**
	 * Serializes the page into a JSON object for persistence.
	 * @return The JSON object to be persisted.
	 */
	public toJsonObject(): JsonObject {
		return { name: this.name, root: this.root ? this.root.toJsonObject() : undefined };
	}
}
