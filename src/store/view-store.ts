import * as Sender from '../message/client';
import { isEqual } from 'lodash';
import { ServerMessageType } from '../message';
import * as Mobx from 'mobx';
import * as Model from '../model';
import * as Types from '../model/types';

import * as uuid from 'uuid';

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

	@Mobx.observable private project: Model.Project;

	private savedProjects: Types.SavedProject[] = [];

	@Mobx.observable private serverPort: number;

	@Mobx.observable private usedPatternLibrary: Model.PatternLibrary | undefined;

	public constructor(init: { app: Model.AlvaApp; history: Model.EditHistory }) {
		this.app = init.app;
		this.editHistory = init.history;
	}

	@Mobx.action
	public addElement(element: Model.Element): void {
		const contents = ViewStore.EPHEMERAL_CONTENTS.get(element) || [];

		contents.forEach(elementContent => {
			elementContent.setParentElement(element);
			this.project.addElementContent(elementContent);
		});

		this.project.addElement(element);
		ViewStore.EPHEMERAL_CONTENTS.delete(element);
	}

	public addSavedProject(project: Model.Project): void {
		this.savedProjects.push(project.toDisk());
	}

	public commit(): void {
		if (!this.project || !this.app) {
			return;
		}

		this.editHistory.push({
			app: this.app.toJSON(),
			project: this.project.toJSON()
		});
	}

	public connectPatternLibrary(): void {
		const project = this.project;

		if (!project) {
			return;
		}

		Sender.send({
			type: ServerMessageType.ConnectPatternLibraryRequest,
			id: uuid.v4(),
			payload: project.toJSON()
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
		const patternLibrary = project.getPatternLibrary();

		const elementContents = init.pattern.getSlots().map(
			slot =>
				new Model.ElementContent(
					{
						elementIds: [],
						id: uuid.v4(),
						name: slot.getName(),
						slotId: slot.getId()
					},
					{ project, patternLibrary }
				)
		);

		const element = new Model.Element(
			{
				contentIds: elementContents.map(e => e.getId()),
				dragged: init.dragged || false,
				highlighted: false,
				forcedOpen: false,
				open: false,
				patternId: init.pattern.getId(),
				placeholderHighlighted: false,
				properties: [],
				setDefaults: true,
				selected: false
			},
			{
				patternLibrary,
				project
			}
		);

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
	public executeElementCut(element: Model.Element): void {
		if (element.getRole() === Types.ElementRole.Root) {
			return;
		}

		this.setClipboardItem(element);
		const selectNext = this.removeElement(element);
		this.commit();
		selectNext();
	}

	@Mobx.action
	public executeElementCutById(id: string): void {
		const element = this.getElementById(id);
		if (!element) {
			return;
		}

		this.setClipboardItem(element);
		const selectNext = this.removeElement(element);
		this.commit();
		selectNext();
	}

	@Mobx.action
	public executeElementCutSelected(): Model.Element | undefined {
		const selectedElement = this.getSelectedElement();

		if (!selectedElement) {
			return;
		}

		this.setClipboardItem(selectedElement);
		const selectNext = this.removeElement(selectedElement);
		this.commit();
		selectNext();

		return selectedElement;
	}

	@Mobx.action
	public executeElementDuplicate(element: Model.Element): Model.Element | undefined {
		const clone = this.duplicateElement(element);

		if (!clone) {
			return;
		}

		this.setSelectedElement(clone);
		this.commit();
		return clone;
	}

	@Mobx.action
	public executeElementDuplicateById(id: string): Model.Element | undefined {
		const element = this.getElementById(id);

		if (!element) {
			return;
		}

		const clone = this.duplicateElement(element);

		if (!clone) {
			return;
		}

		this.commit();
		this.setSelectedElement(clone);
		return clone;
	}

	@Mobx.action
	public executeElementDuplicateSelected(): Model.Element | undefined {
		const selectedElement = this.getSelectedElement();

		if (!selectedElement) {
			return;
		}

		const clone = this.duplicateElement(selectedElement);

		if (!clone) {
			return;
		}

		this.commit();
		this.setSelectedElement(clone);
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

		this.commit();
		this.setSelectedElement(element);
		return element;
	}

	@Mobx.action
	public executeElementInsertInside(init: {
		element: Model.Element;
		targetElement: Model.Element;
	}): Model.Element | undefined {
		if (init.element.getRole() === Types.ElementRole.Root) {
			return;
		}

		this.insertElementInside(init);
		this.commit();
		this.setSelectedElement(init.element);

		return init.element;
	}

	public executeElementMove(init: {
		content: Model.ElementContent;
		element: Model.Element;
		index: number;
	}): void {
		this.moveElement(init);
		this.commit();
	}

	@Mobx.action
	public executeElementPasteAfter(targetElement: Model.Element): Model.Element | undefined {
		const clipboardElement = this.getClipboardItem(ClipBoardType.Element);

		if (!clipboardElement) {
			return;
		}

		const element = this.insertElementAfter({ element: clipboardElement, targetElement });

		if (!element) {
			return;
		}

		this.setSelectedElement(element);
		this.commit();
		return element;
	}

	@Mobx.action
	public executeElementPasteAfterById(id: string): Model.Element | undefined {
		const element = this.getElementById(id);

		if (!element) {
			return;
		}

		return this.executeElementPasteAfter(element);
	}

	@Mobx.action
	public executeElementPasteAfterSelected(): Model.Element | undefined {
		const selectedElement = this.getSelectedElement();
		const page = this.getCurrentPage();
		const rootElement = page ? page.getRoot() : undefined;

		if (!selectedElement && !rootElement) {
			return;
		}

		if (selectedElement) {
			return this.executeElementPasteAfter(selectedElement);
		}

		if (rootElement) {
			return this.executeElementPasteInside(rootElement);
		}

		return;
	}

	@Mobx.action
	public executeElementPasteInside(element: Model.Element): Model.Element | undefined {
		const clipboardElement = this.getClipboardItem(ClipBoardType.Element);

		if (!clipboardElement) {
			return;
		}

		this.insertElementInside({ element: clipboardElement, targetElement: element });
		this.setSelectedElement(clipboardElement);
		this.commit();

		return clipboardElement;
	}

	@Mobx.action
	public executeElementPasteInsideById(id: string): Model.Element | undefined {
		const element = this.getElementById(id);

		if (!element) {
			return;
		}

		const clipboardElement = this.getClipboardItem(ClipBoardType.Element);

		if (!clipboardElement) {
			return;
		}

		this.insertElementInside({ element: clipboardElement, targetElement: element });
		this.setSelectedElement(element);
		this.commit();

		return element;
	}

	@Mobx.action
	public executeElementPasteInsideSelected(): Model.Element | undefined {
		const selectedElement = this.getSelectedElement();

		if (!selectedElement) {
			return;
		}

		const clipboardElement = this.getClipboardItem(ClipBoardType.Element);

		if (!clipboardElement) {
			return;
		}

		this.insertElementInside({ element: clipboardElement, targetElement: selectedElement });
		this.setSelectedElement(clipboardElement);
		this.commit();

		return clipboardElement;
	}

	@Mobx.action
	public executeElementRemove(element: Model.Element): void {
		const selectNext = this.removeElement(element);
		this.commit();
		selectNext();
	}

	@Mobx.action
	public executeElementRemoveById(id: string): void {
		const element = this.getElementById(id);

		if (element) {
			const selectNext = this.removeElement(element);
			this.commit();
			selectNext();
		}
	}

	@Mobx.action
	public executeElementRemoveSelected(): Model.Element | undefined {
		const selectedElement = this.getSelectedElement();

		if (!selectedElement) {
			return;
		}

		const selectNext = this.removeElement(selectedElement);
		this.commit();
		selectNext();
		return selectedElement;
	}

	@Mobx.action
	public executeElementRename(editableElement: Model.Element): void {
		editableElement.setName(editableElement.getName());
		this.commit();
	}

	@Mobx.action
	public executePageAddNew(): Model.Page | undefined {
		const patternLibrary = this.project.getPatternLibrary();
		const name = 'Untitled Page';

		const count = this.project.getPages().filter(p => p.getName().startsWith(name)).length;

		const page = Model.Page.create(
			{
				active: false,
				id: uuid.v4(),
				name: `${name} ${count + 1}`,
				patternLibrary: this.project.getPatternLibrary()
			},
			{ project: this.project, patternLibrary }
		);

		this.project.addPage(page);
		this.commit();
		this.setActivePage(page);

		return page;
	}

	@Mobx.action
	public executePageRemove(page: Model.Page): void {
		this.removePage(page);
		this.commit();
	}

	@Mobx.action
	public executePageRemoveSelected(): Model.Page | undefined {
		const page = this.getCurrentPage();

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

	public getAppState(): Types.AppState {
		return this.app.getState();
	}

	public getClipboardItem(type: ClipBoardType.Element): Model.Element | undefined;
	public getClipboardItem(type: ClipBoardType.Page): Model.Page | undefined;

	@Mobx.action
	public getClipboardItem(type: ClipBoardType): Model.Page | Model.Element | undefined {
		const item = this.clipboardItem;

		if (!item || item.type !== type) {
			return;
		}

		return item.item.clone();
	}

	public getContentById(id: string): Model.ElementContent | undefined {
		const project = this.getProject();

		let result;

		project.getPages().some(page => {
			result = page.getContentById(id);
			return result;
		});

		return result;
	}

	/**
	 * Returns the page content that is currently being displayed in the preview,
	 * and edited in the elements and properties panes. May be undefined if there is none.
	 * @return The page content that is currently being displayed in the preview, or undefined.
	 */
	public getCurrentPage(): Model.Page | undefined {
		if (!this.project) {
			return;
		}

		return this.project.getPages().find(page => page.getActive());
	}

	public getDraggedElement(): Model.Element | undefined {
		return this.project.getElements().find(e => e.getDragged());
	}

	public getDragging(): boolean {
		return this.project.getElements().some(e => e.getDragged());
	}

	public getElementById(id: string): Model.Element | undefined {
		const project = this.getProject();

		let result;

		project.getPages().some(page => {
			result = page.getElementById(id);
			return result;
		});

		return result;
	}

	public getNameEditableElement(): Model.Element | undefined {
		return this.project.getElements().find(e => e.getNameEditable());
	}

	public getPageById(id: string): Model.Page | undefined {
		const project = this.getProject();

		if (!project) {
			return;
		}

		return project.getPageById(id);
	}

	public getPatternById(id: string): Model.Pattern | undefined {
		const project = this.getProject();

		if (!project) {
			return;
		}

		const patternLibrary = project.getPatternLibrary();

		if (!patternLibrary) {
			return;
		}

		return patternLibrary.getPatternById(id);
	}

	public getPatternLibrary(): Model.PatternLibrary | undefined {
		const project = this.getProject();

		if (!project) {
			return;
		}

		return project.getPatternLibrary();
	}

	public getPatternLibraryState(): Types.PatternLibraryState | undefined {
		const patternLibrary = this.getPatternLibrary();

		if (!patternLibrary) {
			return;
		}

		return patternLibrary.getState();
	}

	public getPatternSearchTerm(): string {
		return this.app.getSearchTerm();
	}

	public getProject(): Model.Project {
		return this.project;
	}

	public getSavedProjects(): Types.SavedProject[] {
		return this.savedProjects;
	}

	public getSelectedElement(): Model.Element | undefined {
		if (!this.project) {
			return;
		}

		return this.project.getElements().find(element => element.getSelected());
	}

	public getServerPort(): number {
		return this.serverPort;
	}

	public getUsedPatternLibrary(): Model.PatternLibrary | undefined {
		return this.usedPatternLibrary;
	}

	public hasApplicableClipboardItem(): boolean {
		const view = this.app.getActiveView();

		if (view === Types.AlvaView.PageDetail) {
			return this.hasClipboardItem(ClipBoardType.Element);
		}

		if (view === Types.AlvaView.Pages) {
			return this.hasClipboardItem(ClipBoardType.Element);
		}

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
		const item = this.editHistory.forward();

		if (!item) {
			return;
		}

		const project = Model.Project.from(item.project);

		if (this.project && isEqual(project.toJSON(), this.project.toJSON())) {
			return;
		}

		this.setApp(Model.AlvaApp.from(item.app));
		this.setProject(project);
	}

	@Mobx.action
	public removeElement(element: Model.Element): () => void {
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
				this.unsetSelectedElement();
			}
		};

		elementContainer.remove({ element });

		return selectNext;
	}

	@Mobx.action
	public removePage(page: Model.Page): void {
		const index = this.project.getPageIndex(page);

		if (index === 0) {
			this.unsetActivePage();
			this.setActiveAppView(Types.AlvaView.Pages);
		} else {
			this.setActivePageByIndex(index - 1);
		}

		this.project.removePage(page);
	}

	@Mobx.action
	public setActiveAppView(appView: Types.AlvaView): void {
		this.app.setActiveView(appView);
		this.commit();
	}

	@Mobx.action
	public setActivePage(page: Model.Page): void {
		if (!this.project) {
			return;
		}

		this.unsetActivePage();
		page.setActive(true);
	}

	@Mobx.action
	public setActivePageById(id: string): void {
		const page = this.getPageById(id);

		if (!this.project || !page) {
			return;
		}

		return this.setActivePage(page);
	}

	@Mobx.action
	public setActivePageByIndex(index: number): void {
		const page = this.project.getPages()[index];

		if (!page) {
			return;
		}

		this.setActivePage(page);
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
	public setNameEditableElement(editableElement?: Model.Element): void {
		const previousElement = this.project.getElements().find(element => element.getNameEditable());

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
		this.unsetHighlightedElement();

		const patternLibrary = project.getPatternLibrary();

		if (patternLibrary) {
			patternLibrary.updateSearch();
		}
	}

	@Mobx.action
	public setSelectedElement(selectedElement: Model.Element): void {
		const previousSelectedElement = this.getSelectedElement();

		if (previousSelectedElement && previousSelectedElement !== selectedElement) {
			this.setNameEditableElement();
		}

		if (previousSelectedElement) {
			previousSelectedElement.setSelected(false);

			previousSelectedElement.getAncestors().forEach(ancestor => {
				ancestor.setForcedOpen(false);
			});
		}

		selectedElement.setSelected(true);

		selectedElement.getAncestors().forEach(ancestor => {
			ancestor.setForcedOpen(true);
		});
	}

	@Mobx.action
	public setServerPort(port: number): void {
		this.serverPort = port;
	}

	@Mobx.action
	public setUsedPatternLibrary(usedPatternLibrary: Model.PatternLibrary | undefined): void {
		this.usedPatternLibrary = usedPatternLibrary;
	}

	@Mobx.action
	public undo(): void {
		const item = this.editHistory.back();

		if (!item) {
			return;
		}

		const project = Model.Project.from(item.project);
		const app = Model.AlvaApp.from(item.app);

		if (this.project && isEqual(project.toJSON(), this.project.toJSON())) {
			return;
		}

		this.setApp(app);
		this.setProject(project);
	}

	@Mobx.action
	public unsetActivePage(): void {
		if (!this.project) {
			return;
		}

		this.project.getPages().forEach(page => page.setActive(false));
	}

	@Mobx.action
	public unsetDraggedElement(): void {
		this.unsetHighlightedElement();
		this.project.getElements().forEach(e => {
			e.setDragged(false);
		});
	}

	@Mobx.action
	public unsetHighlightedElement(): void {
		this.project.getElements().forEach(e => {
			e.setHighlighted(false);
			e.setPlaceholderHighlighted(false);
		});
	}

	@Mobx.action
	public unsetSelectedElement(): void {
		if (!this.project) {
			return;
		}

		this.project.getElements().forEach(element => {
			element.setSelected(false);
			element.getAncestors().forEach(ancestor => {
				ancestor.setForcedOpen(false);
			});
		});
	}

	@Mobx.action
	public updatePatternLibrary(): void {
		const project = this.project;

		if (!project) {
			return;
		}

		Sender.send({
			type: ServerMessageType.UpdatePatternLibraryRequest,
			id: uuid.v4(),
			payload: project.toJSON()
		});
	}
}
