import { Element, ElementContent } from '../element';
import * as Mobx from 'mobx';
import { PatternLibrary } from '../pattern-library';
import { Project } from '../project';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface PageInit {
	id: string;
	name: string;
	rootId: string;
}

export interface PageCreateInit {
	id: string;
	name: string;
	patternLibrary: PatternLibrary;
}

export interface PageContext {
	patternLibrary: PatternLibrary;
	project: Project;
}

export class Page {
	/**
	 * Intermediary edited name
	 */
	@Mobx.observable private editedName: string = '';

	/**
	 * The technical unique identifier of this page
	 */
	@Mobx.observable private id: string;

	/**
	 * The human-friendly name of the page.
	 * In the frontend, to be displayed instead of the ID.
	 */
	@Mobx.observable private name: string = 'Page';

	/**
	 * Wether the name may be edited
	 */
	@Mobx.observable public nameState: Types.EditState = Types.EditState.Editable;

	private patternLibrary: PatternLibrary;

	private project: Project;

	/**
	 * The root element of the page, the first pattern element of the content tree.
	 */
	private rootId: string;

	public constructor(init: PageInit, context: PageContext) {
		this.id = init.id;
		this.rootId = init.rootId;
		this.name = init.name;
		this.project = context.project;

		const rootElement = this.getRoot();

		if (rootElement) {
			rootElement.setPage(this);
		}
	}

	@Mobx.action
	public static create(init: PageCreateInit, context: PageContext): Page {
		const rootPattern = context.patternLibrary.getPatternByType(Types.PatternType.SyntheticPage);

		const rootContents = rootPattern.getSlots().map(
			slot =>
				new ElementContent(
					{
						elementIds: [],
						id: uuid.v4(),
						name: slot.getName(),
						slotId: slot.getId()
					},
					context
				)
		);

		rootContents.forEach(rootContent => context.project.addElementContent(rootContent));

		const rootElement = new Element(
			{
				highlighted: false,
				name: init.name,
				contentIds: rootContents.map(c => c.getId()),
				dragged: false,
				open: true,
				forcedOpen: false,
				patternId: rootPattern.getId(),
				placeholderHighlighted: false,
				properties: [],
				setDefaults: true,
				selected: false
			},
			{
				patternLibrary: context.patternLibrary,
				project: context.project
			}
		);

		rootContents.forEach(rootContent => rootContent.setParentElement(rootElement));
		context.project.addElement(rootElement);

		return new Page(
			{
				id: init.id,
				name: init.name,
				rootId: rootElement.getId()
			},
			context
		);
	}

	/**
	 * Loads and returns a page from a given JSON object.
	 * @param jsonObject The JSON object to load from.
	 * @param id The ID of the resulting page
	 * @return A new page object containing the loaded data.
	 */
	public static from(serializedPage: Types.SerializedPage, context: PageContext): Page {
		const page = new Page(
			{
				id: serializedPage.id,
				name: serializedPage.name,
				rootId: serializedPage.rootId
			},
			context
		);

		return page;
	}

	public clone(): Page {
		return Page.from(this.toJSON(), {
			project: this.project,
			patternLibrary: this.patternLibrary
		});
	}

	public getContentById(id: string): ElementContent | undefined {
		const rootElement = this.getRoot();

		if (!rootElement) {
			return;
		}

		return rootElement.getContentById(id);
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
	public getElementById(id: string): Element | undefined {
		const rootElement = this.getRoot();

		if (!rootElement) {
			return;
		}

		return rootElement.getElementById(id);
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
		if ((!options || !options.unedited) && this.nameState === Types.EditState.Editing) {
			return this.editedName;
		}

		return this.name;
	}

	/**
	 * Get the editable state of the page name
	 * @param state
	 */
	public getNameState(): Types.EditState {
		return this.nameState;
	}

	/**
	 * Returns the root element of the page, the first pattern element of the content tree.
	 * @return The root element of the page.
	 */
	public getRoot(): Element | undefined {
		return this.project.getElementById(this.rootId);
	}

	@Mobx.action
	public setName(name: string): void {
		if (this.nameState === Types.EditState.Editing) {
			this.editedName = name;
			return;
		}

		this.name = name;
	}

	@Mobx.action
	public setNameState(state: Types.EditState): void {
		if (state === Types.EditState.Editing) {
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
	public toJSON(): Types.SerializedPage {
		return {
			id: this.getId(),
			name: this.getName(),
			rootId: this.rootId
		};
	}
}
