import * as MobX from 'mobx';
import { PageElement } from './page-element';
import { Styleguide, SyntheticPatternType } from '../styleguide';
import * as Types from '../types';
import * as uuid from 'uuid';

export enum EditState {
	Editable = 'Editable',
	Editing = 'Editing'
}

export interface PageInit {
	id?: string;
	name?: string;
	root: PageElement;
}

export interface PageCreateInit {
	id?: string;
	name: string;
	root?: PageElement;
	styleguide: Styleguide;
}

export interface PageContext {
	styleguide: Styleguide;
}

/**
 * The current actually loaded page of a project. It consists of a tree of page elements,
 * which in turn provide the properties data for the pattern components.
 */
export class Page {
	private context?: PageContext;

	/**
	 * Intermediary edited name
	 */
	@MobX.observable private editedName: string = '';

	/**
	 * The technical unique identifier of this page
	 */
	@MobX.observable private id: string;

	/**
	 * The human-friendly name of the page.
	 * In the frontend, to be displayed instead of the ID.
	 */
	@MobX.observable private name: string = 'Page';

	/**
	 * Wether the name may be edited
	 */
	@MobX.observable public nameState: EditState = EditState.Editable;

	/**
	 * The root element of the page, the first pattern element of the content tree.
	 */
	private root: PageElement;

	/**
	 * Creates a new page.
	 * @param id The technical (internal) ID of the page.
	 * @param store The global application store.
	 */
	public constructor(init: PageInit, context?: PageContext) {
		this.id = init.id || uuid.v4();
		this.root = init.root;
		this.root.setPage(this);

		if (typeof init.name !== 'undefined') {
			this.name = init.name;
		}

		this.context = context;
	}

	/**
	 * Create a new empty page
	 */
	public static create(init: PageCreateInit): Page {
		return new Page({
			id: init.id || uuid.v4(),
			name: init.name,
			root:
				init.root ||
				new PageElement({
					name: init.name,
					pattern: init.styleguide.getPatternByType(SyntheticPatternType.SyntheticPage),
					contents: []
				})
		});
	}

	/**
	 * Loads and returns a page from a given JSON object.
	 * @param jsonObject The JSON object to load from.
	 * @param id The ID of the resulting page
	 * @return A new page object containing the loaded data.
	 */
	public static from(serializedPage: Types.SerializedPage, context: PageContext): Page {
		return new Page(
			{
				id: serializedPage.id,
				name: serializedPage.name,
				root: PageElement.from(serializedPage.root, context)
			},
			context
		);
	}

	public clone(): Page {
		if (this.context) {
			return Page.from(this.toJSON(), this.context);
		}

		throw new Error(`Page ${this.getId()} needs to store context in order to be cloned`);
	}

	/**
	 * Get the current edited value of the page name
	 */
	public getEditedName(): string {
		return this.editedName;
	}

	/**
	 * Returns the page element for a given Id or undefined, if no such ID exists.
	 * @return The page element or undefined.
	 */
	public getElementById(id: string): PageElement | undefined {
		return this.root.getElementById(id);
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
	public getName(options?: { unedited: boolean }): string {
		if ((!options || !options.unedited) && this.nameState === EditState.Editing) {
			return this.editedName;
		}

		return this.name;
	}

	/**
	 * Get the editable state of the page name
	 * @param state
	 */
	public getNameState(): EditState {
		return this.nameState;
	}

	/**
	 * Returns the root element of the page, the first pattern element of the content tree.
	 * @return The root element of the page.
	 */
	public getRoot(): PageElement | undefined {
		return this.root;
	}

	/**
	 * Sets the human-friendly name of the page.
	 * @param name The human-friendly name of the page.
	 */
	@MobX.action
	public setName(name: string): void {
		if (this.nameState === EditState.Editing) {
			this.editedName = name;
			return;
		}

		this.name = name;
	}

	/**
	 * Sets the editable state of the page name
	 * @param state
	 */
	public setNameState(state: EditState): void {
		if (state === EditState.Editing) {
			this.editedName = this.name;
		}

		this.nameState = state;
	}

	/**
	 * Serializes the page into a JSON object for persistence.
	 * @param forRendering Whether all property values should be converted using
	 * Property.convertToRender (for the preview app instead of file persistence).
	 * @return The JSON object to be persisted.
	 * @see Property.convertToRender()
	 */
	public toJSON(props?: { forRendering?: boolean }): Types.SerializedPage {
		return {
			id: this.getId(),
			name: this.getName(),
			root: this.root.toJSON(props)
		};
	}
}
