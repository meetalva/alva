import { Sender } from '../sender';
import { isEqual } from 'lodash';
import { MessageType } from '../message';
import * as Mobx from 'mobx';
import * as Model from '../model';
import * as Types from '../types';

import * as uuid from 'uuid';
import { PlaceholderPosition } from '../components';

const EMPTY_ARRAY: never[] = [];

export interface ViewStoreInit {
	app: Model.AlvaApp;
	sender: Sender;
	history: Model.EditHistory;
}

export enum ClipBoardType {
	Page = 'Page',
	Element = 'Element'
}

export type ClipBoardItem = ClipboardPage | ClipboardElement;

export interface ClipboardPage {
	item: Model.Page;
	type: ClipBoardType.Page;
}

export interface ClipboardElement {
	item: Model.Element;
	type: ClipBoardType.Element;
}

export interface WithStore {
	store: ViewStore;
}

/**
 * The central entry-point for all view-related application state, managed by MobX.
 * Use this object and its properties in your React components,
 * and call the respective business methods to perform operations.
 */
export class ViewStore {
	private static EPHEMERAL_CONTENTS: WeakMap<
		Model.Element,
		Model.ElementContent[]
	> = new WeakMap();

	@Mobx.observable private app: Model.AlvaApp;

	@Mobx.observable private clipboardItem?: ClipBoardItem;

	private editHistory: Model.EditHistory;

	@Mobx.observable private metaDown: boolean = false;

	@Mobx.observable private project?: Model.Project;

	@Mobx.observable private serverPort?: number;

	@Mobx.observable private sender: Sender;

	@Mobx.computed
	private get elements(): Model.Element[] {
		if (!this.project) {
			return EMPTY_ARRAY;
		}

		return this.project.getElements();
	}

	@Mobx.computed
	private get elementContents(): Model.ElementContent[] {
		if (!this.project) {
			return EMPTY_ARRAY;
		}

		return this.project.getElementContents();
	}

	@Mobx.computed
	private get draggedElement(): Model.Element | undefined {
		return this.elements.find(e => e.getDragged());
	}

	@Mobx.computed
	private get highlightedElement(): Model.Element | undefined {
		return this.elements.find(element => element.getHighlighted());
	}

	@Mobx.computed
	private get highlightedElementContent(): Model.ElementContent | undefined {
		return this.elementContents.find(c => c.getHighlighted());
	}

	@Mobx.computed
	private get placeholderHighlightedElement(): Model.Element | undefined {
		return this.elements.find(
			element => element.getPlaceholderHighlighted() !== PlaceholderPosition.None
		);
	}

	public constructor(init: ViewStoreInit) {
		this.app = init.app;
		this.editHistory = init.history;
		this.sender = init.sender;
	}

	@Mobx.action
	public addElement(element: Model.Element): void {
		const project = this.project;

		if (!project) {
			return;
		}

		const contents = ViewStore.EPHEMERAL_CONTENTS.get(element) || [];

		contents.forEach(elementContent => {
			elementContent.setParentElement(element);
			project.addElementContent(elementContent);
		});

		project.addElement(element);
		ViewStore.EPHEMERAL_CONTENTS.delete(element);
	}

	public commit(): void {
		if (!this.project || !this.app) {
			return;
		}

		this.editHistory.push({
			app: this.app.toJSON(),
			project: this.project.toJSON()
		});

		window.requestIdleCallback(() => {
			this.save();
		});
	}

	public stage(): void {
		if (!this.project || !this.app) {
			return;
		}

		this.editHistory.replace({
			app: this.app.toJSON(),
			project: this.project.toJSON()
		});
	}

	@Mobx.action
	public connectPatternLibrary(library?: Model.PatternLibrary): void {
		const project = this.project;

		if (!project) {
			return;
		}

		this.getApp().send({
			type: MessageType.ConnectPatternLibraryRequest,
			id: uuid.v4(),
			payload: {
				projectId: project.getId(),
				library: library ? library.getId() : undefined
			}
		});
	}

	@Mobx.action
	public copyElementById(id: string): Model.Element | undefined {
		const element = this.getElementById(id);

		if (!element) {
			return;
		}

		this.setClipboardItem(element);
		return element;
	}

	/**
	 * Copy the currently selected element to clip
	 */
	@Mobx.action
	public copySelectedElement(): Model.Element | undefined {
		const selectedElement = this.getSelectedElement();

		if (!selectedElement) {
			return;
		}

		this.setClipboardItem(selectedElement);
		return selectedElement;
	}

	@Mobx.action
	public createElement(init: { dragged?: boolean; pattern: Model.Pattern }): Model.Element {
		const project = this.getProject();

		const elementContents = init.pattern
			.getSlots()
			.map(slot => Model.ElementContent.fromSlot(slot, { project }));

		const element = Model.Element.fromPattern(init.pattern, {
			dragged: Boolean(init.dragged),
			contents: elementContents,
			project
		});

		ViewStore.EPHEMERAL_CONTENTS.set(element, elementContents);
		return element;
	}

	@Mobx.action
	public duplicateElement(element: Model.Element): Model.Element | undefined {
		const clone = this.insertElementAfter({ element: element.clone(), targetElement: element });

		if (!clone) {
			return;
		}

		return clone;
	}

	@Mobx.action
	public duplicatePage(page: Model.Page): Model.Page | undefined {
		const project = this.project;

		if (!project) {
			return;
		}

		const clone = page.clone();

		project.addPage(clone);

		project.movePageAfter({
			page: clone,
			targetPage: page
		});

		if (!clone) {
			return;
		}

		return clone;
	}

	@Mobx.action
	public duplicateElementById(id: string): Model.Element | undefined {
		const element = this.getElementById(id);

		if (!element) {
			return;
		}

		const clone = this.duplicateElement(element);

		if (!clone) {
			return;
		}

		this.setSelectedElement(clone);
		this.commit();
		return clone;
	}

	@Mobx.action
	public duplicateSelectedElement(): Model.Element | undefined {
		const selectedElement = this.getSelectedElement();

		if (!selectedElement) {
			return;
		}

		const clone = this.duplicateElement(selectedElement);

		if (!clone) {
			return;
		}

		this.setSelectedElement(clone);
		this.commit();
		return clone;
	}

	@Mobx.action
	public duplicateActivePage(): Model.Page | undefined {
		const project = this.project;

		if (!project) {
			return;
		}

		const activePage = this.getActivePage();

		if (!activePage) {
			return;
		}

		const clone = this.duplicatePage(activePage);

		if (!clone) {
			return;
		}

		project.setActivePage(clone);
		this.commit();
		return clone;
	}

	@Mobx.action
	public executeElementInsertAfter(init: {
		element: Model.Element;
		targetElement: Model.Element;
	}): Model.Element | undefined {
		const element = this.insertElementAfter(init);

		if (!element) {
			return;
		}

		this.setSelectedElement(element);
		this.commit();
		return element;
	}

	@Mobx.action
	public executeElementMove(init: {
		content: Model.ElementContent;
		element: Model.Element;
		index: number;
	}): void {
		const project = this.project;

		if (!project) {
			return;
		}

		this.moveElement(init);
		project.unsetPlaceholderHighlightedElement();
		this.commit();
	}

	@Mobx.action
	public removeElementById(id: string): void {
		const element = this.getElementById(id);

		if (element) {
			const selectNext = this.removeElement(element);
			selectNext();
			this.commit();
		}
	}

	@Mobx.action
	public removePageById(id: string): void {
		const page = this.getPageById(id);

		if (page) {
			this.removePage(page);
			this.commit();
		}
	}

	@Mobx.action
	public removeSelectedElement(): Model.Element | undefined {
		const selectedElement = this.getSelectedElement();

		if (!selectedElement) {
			return;
		}

		const selectNext = this.removeElement(selectedElement);
		selectNext();
		this.commit();
		return selectedElement;
	}

	@Mobx.action
	public executeElementRename(editableElement: Model.Element): void {
		editableElement.setName(editableElement.getName());
		this.commit();
	}

	@Mobx.action
	public executePageAddNew(): Model.Page | undefined {
		const name = 'Page';

		const project = this.project;

		if (!project) {
			return;
		}

		const count = project.getPages().filter(p => p.getName().startsWith(name)).length;

		const page = Model.Page.create(
			{
				active: false,
				id: uuid.v4(),
				name: `${name} ${count + 1}`
			},
			{ project }
		);

		project.addPage(page);
		project.setActivePage(page);
		this.commit();

		return page;
	}

	@Mobx.action
	public executePageRemove(page: Model.Page): void {
		this.removePage(page);
		this.commit();
	}

	@Mobx.action
	public removeSelectedPage(): Model.Page | undefined {
		const page = this.getActivePage();

		if (!page) {
			return;
		}

		this.removePage(page);
		this.commit();

		return page;
	}

	public getActiveAppView(): Types.AlvaView {
		return this.app.getActiveView();
	}

	public getActivePage(): Model.Page | undefined {
		if (!this.project) {
			return;
		}

		return this.project.getPages().find(page => page.getActive());
	}

	public getApp(): Model.AlvaApp {
		return this.app;
	}

	public getContentById(id: string): Model.ElementContent | undefined {
		const project = this.getProject();

		let result: Model.ElementContent | undefined;

		project.getPages().some(page => {
			result = page.getContentById(id);
			return typeof result !== 'undefined';
		});

		return result;
	}

	public getDraggedElement(): Model.Element | undefined {
		return this.draggedElement;
	}

	public getDragging(): boolean {
		return typeof this.draggedElement !== 'undefined';
	}

	public getEditHistory(): Model.EditHistory {
		return this.editHistory;
	}

	public getElementActions(): Model.ElementAction[] {
		if (!this.project) {
			return [];
		}

		return this.project.getElementActions();
	}

	public getElementContents(): Model.ElementContent[] {
		if (!this.project) {
			return [];
		}

		return this.project.getElementContents();
	}

	public getElements(): Model.Element[] {
		if (!this.project) {
			return [];
		}

		return this.project.getElements();
	}

	public getElementById(id: string): Model.Element | undefined {
		const project = this.project;

		if (!project) {
			return;
		}

		return project.getElementById(id);
	}

	public getPlaceHolderHighhlightedElement(): Model.Element | undefined {
		return this.placeholderHighlightedElement;
	}

	public getHighlightedElement(): Model.Element | undefined {
		return this.highlightedElement;
	}

	public getHighlightedElementContent(): Model.ElementContent | undefined {
		return this.highlightedElementContent;
	}

	public getMetaDown(): boolean {
		return this.metaDown;
	}

	public getNameEditableElement(): Model.Element | undefined {
		const project = this.project;

		if (!project) {
			return;
		}

		return project.getElements().find(e => e.getNameEditable());
	}

	public getPageById(id: string): Model.Page | undefined {
		const project = this.getProject();

		if (!project) {
			return;
		}

		return project.getPageById(id);
	}

	public getPages(): Model.Page[] {
		const project = this.getProject();

		if (!project) {
			return [];
		}

		return project.getPages();
	}

	public getPatternById(id: string): Model.Pattern | undefined {
		const project = this.getProject();

		if (!project) {
			return;
		}

		return project.getPatternById(id);
	}

	public getPatternLibraries(): Model.PatternLibrary[] {
		const project = this.getProject();

		if (!project) {
			return [];
		}

		return project.getPatternLibraries();
	}

	public getPatternSearchTerm(): string {
		return this.app.getSearchTerm();
	}

	public getProject(): Model.Project {
		return this.project!;
	}

	public getSelectedElement(): Model.Element | undefined {
		if (!this.project) {
			return;
		}

		return this.project.getSelectedElement();
	}

	public getSender(): Sender {
		return this.sender;
	}

	public getServerPort(): number {
		return this.serverPort!;
	}

	public hasApplicableClipboardItem(): boolean {
		const view = this.app.getActiveView();

		if (view === Types.AlvaView.PageDetail) {
			return this.hasClipboardItem(ClipBoardType.Element);
		}

		/*if (view === Types.AlvaView.Pages) {
			return this.hasClipboardItem(ClipBoardType.Element);
		}*/

		return false;
	}

	public hasClipboardItem(type: ClipBoardType): boolean {
		const item = this.clipboardItem;

		if (!item) {
			return false;
		}

		return item.type === type;
	}

	public insertElementAfter(init: {
		element: Model.Element;
		targetElement: Model.Element;
	}): Model.Element | undefined {
		if (init.element.getRole() === Types.ElementRole.Root) {
			return;
		}

		if (init.targetElement.getRole() === Types.ElementRole.Root) {
			return this.insertElementInside(init);
		}

		const container = init.targetElement.getContainer();

		if (!container) {
			return;
		}

		this.moveElement({
			element: init.element,
			content: container,
			index: init.targetElement.getIndex() + 1
		});

		return init.element;
	}

	public insertElementInside(init: {
		element: Model.Element;
		targetElement: Model.Element;
	}): Model.Element | undefined {
		const contents = init.targetElement.getContentBySlotType(Types.SlotType.Children);

		if (!contents) {
			return;
		}

		this.moveElement({
			element: init.element,
			content: contents,
			index: contents.getElements().length
		});

		return init.element;
	}

	public moveElement(init: {
		content: Model.ElementContent;
		element: Model.Element;
		index: number;
	}): void {
		const previousContainer = init.element.getContainer();

		if (previousContainer) {
			previousContainer.remove({ element: init.element });
		}

		init.content.insert({ element: init.element, at: init.index });
		init.element.setContainer(init.content);
	}

	@Mobx.action
	public redo(): void {
		const p = this.project;

		if (!p) {
			return;
		}

		const item = this.editHistory.forward();

		if (!item) {
			return;
		}

		const project = Model.Project.from(item.project);

		if (this.project && isEqual(project.toJSON(), this.project.toJSON())) {
			return;
		}

		const nowSelected = p.getSelectedElement();

		this.setApp(Model.AlvaApp.from(item.app, { sender: this.getSender() }));
		this.getProject().update(project);

		const previouslySelected = project.getSelectedElement();

		const elementToSelect = previouslySelected
			? p.getElementById(previouslySelected.getId())
			: undefined;

		const elementToUnselect = nowSelected ? p.getElementById(nowSelected.getId()) : undefined;

		if (elementToUnselect) {
			elementToUnselect.setSelected(false);
		}

		if (elementToSelect) {
			this.setSelectedElement(elementToSelect);
		}
	}

	@Mobx.action
	public removeElement(element: Model.Element): () => void {
		const project = this.project;

		if (typeof project === 'undefined') {
			// tslint:disable-next-line:no-empty
			return () => {};
		}

		if (element.getRole() === Types.ElementRole.Root) {
			return () => undefined;
		}

		const elementContainer = element.getContainer();

		if (!elementContainer) {
			return () => undefined;
		}

		const index = element.getIndex();
		const container = element.getContainer();

		const selectNext = () => {
			const project = this.project;

			if (typeof project === 'undefined') {
				return;
			}

			if (typeof index !== 'number') {
				return;
			}

			const nextIndex = index > 0 ? Math.max(index - 1, 0) : 0;

			if (!container) {
				return;
			}

			const elementBefore = container.getElements()[nextIndex];

			if (elementBefore) {
				this.setSelectedElement(elementBefore);
			} else {
				project.unsetSelectedElement();
			}
		};

		project.removeElement(element);
		elementContainer.remove({ element });

		return selectNext;
	}

	@Mobx.action
	public removePage(page: Model.Page): void {
		const index = page.getIndex();

		const project = this.project;

		if (typeof project === 'undefined') {
			return;
		}

		if (project.getPages().length > 1) {
			if (index !== 0) {
				project.setActivePageByIndex(index - 1);
			} else {
				project.setActivePageByIndex(index + 1);
			}

			project.removePage(page);
		}
	}

	@Mobx.action
	public requestContextMenu(payload: Types.ContextMenuRequestPayload): void {
		this.getApp().send({
			id: uuid.v4(),
			type: MessageType.ContextMenuRequest,
			payload
		});
	}

	@Mobx.action
	public save(): void {
		const project = this.project;

		if (typeof project === 'undefined') {
			return;
		}

		this.getApp().send({
			id: uuid.v4(),
			payload: { publish: false, projectId: project.getId() },
			type: MessageType.Save
		});
	}

	@Mobx.action
	public setActiveAppView(appView: Types.AlvaView): void {
		this.app.setActiveView(appView);
		this.commit();
	}

	@Mobx.action
	public setApp(app: Model.AlvaApp): void {
		if (isEqual(app.toJSON(), this.app.toJSON())) {
			return;
		}

		this.app = app;
	}

	@Mobx.action
	public setClipboardItem(item: Model.Element | Model.Page): void {
		if (item instanceof Model.Element) {
			if (item.getRole() === Types.ElementRole.Root) {
				return;
			}

			this.clipboardItem = {
				type: ClipBoardType.Element,
				item
			};
		}

		if (item instanceof Model.Page) {
			this.clipboardItem = {
				type: ClipBoardType.Page,
				item
			};
		}
	}

	@Mobx.action
	public setHighlightedElement(
		highlightedElement: Model.Element,
		options?: { flat: boolean }
	): void {
		const previousHighlightedElement = this.getHighlightedElement();

		if (previousHighlightedElement) {
			previousHighlightedElement.setHighlighted(false);

			previousHighlightedElement.getAncestors().forEach(ancestor => {
				const descendants = ancestor.getDescendants();
				if (!descendants.some(d => d.getSelected() || d.getHighlighted())) {
					ancestor.setForcedOpen(false);
				}
			});
		}

		highlightedElement.setHighlighted(true);

		if (!options || !options.flat) {
			highlightedElement.getAncestors().forEach(ancestor => {
				ancestor.setForcedOpen(true);
			});
		}
	}

	@Mobx.action
	public setMetaDown(metaDown: boolean): void {
		this.metaDown = metaDown;
	}

	@Mobx.action
	public setNameEditableElement(editableElement?: Model.Element): void {
		const project = this.project;

		if (typeof project === 'undefined') {
			return;
		}

		const previousElement = project.getElements().find(element => element.getNameEditable());

		if (previousElement && previousElement !== editableElement) {
			previousElement.setNameEditable(false);
		}

		if (editableElement) {
			editableElement.setNameEditable(true);
		}
	}

	@Mobx.action
	public setPatternSearchTerm(patternSearchTerm: string): void {
		this.app.setSearchTerm(patternSearchTerm);
	}

	@Mobx.action
	public setProject(project: Model.Project): void {
		this.project = project;
		this.project.unsetHighlightedElement();
		this.project.unsetSelectedElement();
	}

	@Mobx.action
	public setSelectedElement(selectedElement: Model.Element): void {
		const project = this.project;

		if (typeof project === 'undefined') {
			return;
		}

		const previousSelectedElement = this.getSelectedElement();

		if (previousSelectedElement && previousSelectedElement !== selectedElement) {
			this.setNameEditableElement();
		}

		if (previousSelectedElement) {
			previousSelectedElement.setSelected(false);

			previousSelectedElement.getAncestors().forEach(ancestor => {
				const descendants = ancestor.getDescendants();
				if (!descendants.some(d => d.getSelected() || d.getHighlighted())) {
					ancestor.setForcedOpen(false);
				}
			});
		}

		selectedElement.setSelected(true);

		this.app.setRightSidebarTab(Types.RightSidebarTab.Properties);
		project.setFocusedItem(selectedElement);

		selectedElement.getAncestors().forEach(ancestor => {
			ancestor.setForcedOpen(true);
		});
	}

	@Mobx.action
	public setServerPort(port: number): void {
		this.serverPort = port;
	}

	@Mobx.action
	public undo(): void {
		const p = this.project;

		if (typeof p === 'undefined') {
			return;
		}

		const item = this.editHistory.back();

		if (!item) {
			console.debug(`store.undo: no edit history item`);
			return;
		}

		const project = Model.Project.from(item.project);

		const app = Model.AlvaApp.from(item.app, { sender: this.getSender() });

		if (this.project && isEqual(project.toJSON(), this.project.toJSON())) {
			console.debug(`store.undo: versions of project ${project.getName()} are equal`);
			return;
		}

		const nowSelected = p.getSelectedElement();

		this.setApp(app);
		this.getProject().update(project);

		const previouslySelected = project.getSelectedElement();

		const elementToSelect = previouslySelected
			? p.getElementById(previouslySelected.getId())
			: undefined;

		const elementToUnselect = nowSelected ? p.getElementById(nowSelected.getId()) : undefined;

		if (elementToUnselect) {
			elementToUnselect.setSelected(false);
		}

		if (elementToSelect) {
			this.setSelectedElement(elementToSelect);
		}
	}

	@Mobx.action
	public unsetClipboardItem(): void {
		this.clipboardItem = undefined;
	}

	@Mobx.action
	public unsetDraggedElement(): void {
		const project = this.project;

		if (typeof project === 'undefined') {
			return;
		}

		project.unsetHighlightedElement();
		project.unsetDraggedElements();
	}

	public updatePatternLibrary(library: Model.PatternLibrary): void {
		const project = this.project;

		if (typeof project === 'undefined') {
			return;
		}

		this.getApp().send({
			type: MessageType.UpdatePatternLibraryRequest,
			payload: {
				libId: library.getId(),
				projectId: project.getId()
			},
			id: uuid.v4()
		});
	}
}
