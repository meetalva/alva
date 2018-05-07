import { JsonObject, Persister } from '../json';
import * as MobX from 'mobx';
import { PageElement } from './page-element';
import { PageRef } from './page-ref';
import { Project } from '../project';
import { Store } from '../store';
import { Styleguide, SyntheticPatternType } from '../styleguide/styleguide';

/**
 * The current actually loaded page of a project. It consists of a tree of page elements,
 * which in turn provide the properties data for the pattern components.
 * @see PageRef
 */
export class Page {
	/**
	 * A lookup of all page elements by their ID.
	 */
	@MobX.observable private elementsById: Map<string, PageElement> = new Map();

	/**
	 * The page reference, containing the technical ID and the human-friendly name of this page.
	 */
	@MobX.observable private pageRef: PageRef;

	/**
	 * The root element of the page, the first pattern element of the content tree.
	 */
	private root?: PageElement;

	/**
	 * Creates a new page.
	 * @param id The technical (internal) ID of the page.
	 * @param store The global application store.
	 */
	public constructor(pageRef: PageRef) {
		this.pageRef = pageRef;
	}

	/**
	 * Create a new empty page
	 */
	public static create(id: string): Page {
		const store = Store.getInstance();
		const styleguide = store.getStyleguide() as Styleguide;
		const pageRef = store.getPageRefById(id);

		if (!pageRef) {
			throw new Error(`Unknown page ID '${id}'`);
		}

		const page = new Page(pageRef);

		page.setRoot(
			new PageElement({
				pattern: styleguide.getSyntheticPattern(SyntheticPatternType.Page)
			})
		);

		return page;
	}

	/**
	 * Loads and returns a page from a given JSON object.
	 * @param jsonObject The JSON object to load from.
	 * @param id The ID of the resulting page
	 * @return A new page object containing the loaded data.
	 */
	public static fromJsonObject(json: JsonObject, id: string): Page {
		const store = Store.getInstance();
		const pageRef = store.getPageRefById(id);
		if (!pageRef) {
			throw new Error(`Unknown page ID '${id}'`);
		}

		const page = new Page(pageRef);
		page.setRoot(PageElement.fromJsonObject(json.root as JsonObject));

		return page;
	}

	/**
	 * Loads and returns a page from a given persisted data file
	 * @param path The absolute file system path to read from
	 * @param id The ID of the resulting page
	 * @return A new page object containing the loaded data.
	 */
	public static fromPath(path: string, id: string): Page {
		return Page.fromJsonObject(Persister.loadYamlOrJson(path), id);
	}

	/**
	 * Returns the page element for a given Id or undefined, if no such ID exists.
	 * @return The page element or undefined.
	 */
	public getElementById(id: string): PageElement | undefined {
		return this.elementsById.get(id);
	}

	/**
	 * Returns the technical (internal) ID of the page.
	 * @return The technical (internal) ID of the page.
	 */
	public getId(): string {
		return this.pageRef.getId();
	}

	/**
	 * Returns the human-friendly name of the page.
	 * In the frontend, to be displayed instead of the ID.
	 * @return The human-friendly name of the page.
	 */
	public getName(): string {
		return this.pageRef.getName();
	}

	/**
	 * Returns the page reference, containing the technical ID and the human-friendly name of this
	 * page.
	 * @return The page reference.
	 */
	public getPageRef(): PageRef {
		return this.pageRef;
	}

	/**
	 * Returns the project of this page.
	 * @return The project of this page.
	 */
	public getProject(): Project {
		return this.pageRef.getProject();
	}

	/**
	 * Returns the root element of the page, the first pattern element of the content tree.
	 * @return The root element of the page.
	 */
	public getRoot(): PageElement | undefined {
		return this.root;
	}

	/**
	 * Adds a given element and all its descendents to the lookup of elements by ID.
	 * @param element The element to start with.
	 */
	public registerElementAndChildren(element: PageElement): void {
		this.elementsById.set(element.getId(), element);
		element.getContents().forEach((slotContents, slotId) => {
			slotContents.forEach(child => this.registerElementAndChildren(child));
		});
	}

	/**
	 * Sets the root element of the page, the first pattern element of the content tree.
	 * @param root The new root element of the page.
	 */
	public setRoot(root?: PageElement | undefined): void {
		if (this.root) {
			this.root.setParentInternal(undefined, undefined, undefined, undefined);
		}

		this.root = root;

		if (root) {
			root.setParentInternal(undefined, undefined, undefined, this);
		}
	}

	/**
	 * Serializes the page into a JSON object for persistence.
	 * @param forRendering Whether all property values should be converted using
	 * Property.convertToRender (for the preview app instead of file persistence).
	 * @return The JSON object to be persisted.
	 * @see Property.convertToRender()
	 */
	public toJsonObject(props?: { forRendering?: boolean }): JsonObject {
		return {
			id: this.getId(),
			name: this.getName(),
			root: this.root ? this.root.toJsonObject(props) : undefined
		};
	}

	/**
	 * Removes a given element and all its descendents from the lookup of elements by ID.
	 * @param element The element to start with.
	 */
	public unregisterElementAndChildren(element: PageElement): void {
		this.elementsById.delete(element.getId());
		element.getContents().forEach(slotContents => {
			slotContents.forEach(child => this.unregisterElementAndChildren(child));
		});
	}
}
