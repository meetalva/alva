import { Element, ElementContent } from '../element';
import * as _ from 'lodash';
import * as Mobx from 'mobx';
import { Project } from '../project';
import * as Types from '../../types';
import * as uuid from 'uuid';
import { PatternLibrary } from '../pattern-library';
import { PlaceholderPosition } from '../../components';

export interface PageInit {
	active: boolean;
	focused: boolean;
	id: string;
	name: string;
	rootId: string;
}

export interface PageCreateInit {
	active: boolean;
	id: string;
	name: string;
}

export interface PageContext {
	project: Project;
}

/**
 * UI Interface to define where a drag drop
 * should take place.
 */
export interface DroppablePageIndex {
	back: boolean;
	next: boolean;
}

export class Page {
	public readonly model = Types.ModelName.Page;

	@Mobx.observable private focused: boolean;
	@Mobx.observable private editedName: string = '';
	@Mobx.observable private id: string;
	@Mobx.observable private name: string = 'Page';
	@Mobx.observable public nameState: Types.EditableTitleState = Types.EditableTitleState.Editable;

	/**
	 * UI property flags to highlight the area
	 * where the page can be dropped.
	 */
	@Mobx.observable
	private droppablePageIndex: DroppablePageIndex = {
		back: false,
		next: false
	};

	private project: Project;
	private rootId: string;

	public constructor(init: PageInit, context: PageContext) {
		this.project = context.project;
		this.id = init.id;

		this.active = init.active;
		this.rootId = init.rootId;
		this.name = init.name;
		this.focused = init.focused;
	}

	@Mobx.computed
	private get active(): boolean {
		return (
			this.project
				.getUserStore()
				.getPageProperty()
				.getValue() === this.id
		);
	}

	private set active(active: boolean) {
		if (active) {
			this.project
				.getUserStore()
				.getPageProperty()
				.setValue(this.id);
		}
	}

	@Mobx.action
	public static create(init: PageCreateInit, context: PageContext): Page {
		const patternLibrary = context.project.getBuiltinPatternLibrary();

		const rootPattern = patternLibrary.getPatternByType(Types.PatternType.SyntheticPage);

		const rootContents = rootPattern.getSlots().map(
			slot =>
				new ElementContent(
					{
						elementIds: [],
						forcedOpen: false,
						highlighted: false,
						id: uuid.v4(),
						open: false,
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
				focused: false,
				patternId: rootPattern.getId(),
				placeholderHighlighted: PlaceholderPosition.None,
				propertyValues: [],
				role: Types.ElementRole.Root,
				setDefaults: true,
				selected: false
			},
			{
				project: context.project
			}
		);

		rootContents.forEach(rootContent => rootContent.setParentElement(rootElement));
		context.project.addElement(rootElement);

		return new Page(
			{
				active: init.active,
				focused: false,
				id: init.id,
				name: init.name,
				rootId: rootElement.getId()
			},
			context
		);
	}

	public static from(serializedPage: Types.SerializedPage, context: PageContext): Page {
		const page = new Page(
			{
				active: serializedPage.active,
				focused: serializedPage.focused,
				id: serializedPage.id,
				name: serializedPage.name,
				rootId: serializedPage.rootId
			},
			context
		);

		return page;
	}

	public clone(opts?: { target: Project; withState: boolean }): Page {
		const target = opts ? opts.target : this.project;
		const withState = Boolean(opts && opts.withState);
		const rootElement = this.getRoot();
		const rootClone = rootElement ? rootElement.clone({ target, withState }) : undefined;

		const page = new Page(
			{
				active: false,
				focused: false,
				id: uuid.v4(),
				name: this.name,
				rootId: rootClone ? rootClone.getId() : ''
			},
			{ project: this.project }
		);

		if (rootClone) {
			this.project.importElement(rootClone);
		}

		return page;
	}

	public equals(b: Page): boolean {
		return _.isEqual(this.toJSON(), b.toJSON());
	}

	public getActive(): boolean {
		return this.active;
	}

	public getContentById(id: string): ElementContent | undefined {
		const rootElement = this.getRoot();

		if (!rootElement) {
			return;
		}

		return rootElement.getContentById(id);
	}
	/**
	 * It return an object containing the states of
	 * of the back and next page drag areas.
	 */
	public getPageDropState(): DroppablePageIndex {
		return this.droppablePageIndex;
	}

	public getFocused(): boolean {
		return this.focused;
	}

	public getEditedName(): string {
		return this.editedName;
	}

	public getElementById(id: string): Element | undefined {
		const rootElement = this.getRoot();

		if (!rootElement) {
			return;
		}

		return rootElement.getElementById(id);
	}

	public getId(): string {
		return this.id;
	}

	public getIndex(): number {
		return this.project.getPages().indexOf(this);
	}

	public getName(options?: { unedited: boolean }): string {
		if ((!options || !options.unedited) && this.nameState === Types.EditableTitleState.Editing) {
			return this.editedName;
		}
		return this.name;
	}

	public getNameState(): Types.EditableTitleState {
		return this.nameState;
	}

	public getRoot(): Element | undefined {
		return this.project.getElementById(this.rootId);
	}

	public hasElement(element: Element): boolean {
		const rootElement = this.getRoot();

		if (!rootElement) {
			return false;
		}

		return rootElement.getDescendants().some(desc => desc.getId() === element.getId());
	}

	@Mobx.action
	public setActive(active: boolean): void {
		this.active = active;
	}

	@Mobx.action
	public setDroppableBackState(droppable: boolean): void {
		this.droppablePageIndex.back = droppable;
	}

	@Mobx.action
	public setDroppableNextState(droppable: boolean): void {
		this.droppablePageIndex.next = droppable;
	}

	@Mobx.action
	public setEditableName(name: string): void {
		this.editedName = name;
	}

	@Mobx.action
	public setFocused(focused: boolean): void {
		this.focused = focused;
	}

	@Mobx.action
	public setName(name: string): void {
		this.name = name;
		this.editedName = name;
	}

	@Mobx.action
	public setNameState(state: Types.EditableTitleState): void {
		this.editedName = this.name;
		this.nameState = state;
	}

	public setProject(project: Project): void {
		this.project = project;
	}

	public toDisk(): Types.SerializedPage {
		const serialized = this.toJSON();
		serialized.active = false;
		return serialized;
	}

	public toJSON(): Types.SerializedPage {
		return {
			model: this.model,
			active: this.getActive(),
			focused: this.getFocused(),
			id: this.getId(),
			name: this.getName(),
			rootId: this.rootId
		};
	}

	public update(b: Page): void {
		this.active = b.active;
		this.name = b.name;
		this.rootId = b.rootId;
	}

	public getLibraryDependencies(): PatternLibrary[] {
		const rootElement = this.getRoot();

		return rootElement ? rootElement.getLibraryDependencies() : [];
	}
}
