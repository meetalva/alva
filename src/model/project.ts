import { Element, ElementContent, ElementProperty } from './element';
import { ElementAction } from './element-action';
import * as Mobx from 'mobx';
import * as _ from 'lodash';
import { Page } from './page';
import { PatternSearch } from './pattern-search';
import { Pattern, PatternSlot } from './pattern';
import { PatternLibrary, PatternLibraryCreateOptions } from './pattern-library';
import { AnyPatternProperty } from './pattern-property';
import * as Types from '../types';
import { UserStore } from './user-store';
import { UserStoreEnhancer, defaultCode } from './user-store-enhancer';
import { UserStoreReference } from './user-store-reference';
import * as uuid from 'uuid';

export interface ProjectProperties {
	id?: string;
	lastChangedAuthor?: string;
	lastChangedDate?: Date;
	name: string;
	pages: Page[];
	path: string;
	patternLibraries: PatternLibrary[];
	userStore: UserStore;
	focusedItemType?: Types.ItemType;
}

export interface ProjectCreateInit {
	name: string;
	path: string;
}

export class Project {
	@Mobx.observable private elements: Map<string, Element> = new Map();

	@Mobx.observable private elementActions: Map<string, ElementAction> = new Map();

	@Mobx.observable private elementContents: Map<string, ElementContent> = new Map();

	@Mobx.observable private focusedItemType: Types.ItemType = Types.ItemType.None;

	@Mobx.observable private id: string;

	@Mobx.observable private name: string;

	@Mobx.observable private pages: Page[] = [];

	@Mobx.observable private path;

	@Mobx.observable private patternLibraries: Map<string, PatternLibrary> = new Map();

	@Mobx.observable private userStore: UserStore;

	@Mobx.computed
	private get patterns(): Pattern[] {
		return this.getPatternLibraries().reduce((ps, lib) => [...ps, ...lib.getPatterns()], []);
	}

	@Mobx.computed
	private get patternProperties(): AnyPatternProperty[] {
		return this.getPatternLibraries().reduce(
			(ps, lib) => [...ps, ...lib.getPatternProperties()],
			[]
		);
	}

	@Mobx.computed
	private get patternSlots(): PatternSlot[] {
		return this.getPatternLibraries().reduce((ps, lib) => [...ps, ...lib.getSlots()], []);
	}

	@Mobx.computed
	private get patternSearch(): PatternSearch {
		return new PatternSearch({ patterns: this.patterns });
	}

	@Mobx.computed
	private get selectedElements(): Element[] {
		return this.getElements().filter(e => e.getSelected());
	}

	@Mobx.computed
	private get highlightedElements(): Element[] {
		return this.getElements().filter(e => e.getHighlighted());
	}

	@Mobx.computed
	private get placeholderHighlightedElements(): Element[] {
		return this.getElements().filter(e => e.getPlaceholderHighlighted());
	}

	@Mobx.computed
	private get highlightedElementContents(): ElementContent[] {
		return this.getElementContents().filter(e => e.getHighlighted());
	}

	@Mobx.computed
	private get draggedElements(): Element[] {
		return this.getElements().filter(e => e.getDragged());
	}

	@Mobx.computed
	private get elementProperties(): Map<string, ElementProperty> {
		const elementProperties = new Map();

		this.elements.forEach(element => {
			element.getProperties().forEach(p => elementProperties.set(p.getId(), p));
		});

		return elementProperties;
	}

	public constructor(init: ProjectProperties) {
		this.name = init.name;
		this.id = init.id ? init.id : uuid.v4();
		this.pages = init.pages ? init.pages : [];
		this.path = init.path;
		this.userStore = init.userStore;

		if (typeof init.focusedItemType !== 'undefined') {
			this.focusedItemType = init.focusedItemType;
		}

		init.patternLibraries.forEach(patternLibrary => {
			if (patternLibrary.getOrigin() === Types.PatternLibraryOrigin.BuiltIn) {
				const updatedLibrary = Project.createBuiltinPatternLibrary({
					getGlobalEnumOptionId: (enumId, contextId) =>
						patternLibrary.assignEnumOptionId(enumId, contextId),
					getGlobalPatternId: contextId => patternLibrary.assignPatternId(contextId),
					getGlobalPropertyId: (patternId, contextId) =>
						patternLibrary.assignPropertyId(patternId, contextId),
					getGlobalSlotId: (patternId, contextId) =>
						patternLibrary.assignSlotId(patternId, contextId)
				});

				patternLibrary.update(updatedLibrary);
			}

			this.patternLibraries.set(patternLibrary.getId(), patternLibrary);
		});
	}

	public static createBuiltinPatternLibrary(opts?: PatternLibraryCreateOptions): PatternLibrary {
		return PatternLibrary.create(
			{
				bundle: '',
				bundleId: '',
				description: 'Basic building blocks available to every new Alva project',
				id: uuid.v4(),
				name: 'Built-In Components',
				origin: Types.PatternLibraryOrigin.BuiltIn,
				patternProperties: [],
				patterns: [],
				state: Types.PatternLibraryState.Connected
			},
			opts
		);
	}

	public static create(init: ProjectCreateInit): Project {
		const userStore = new UserStore({
			id: uuid.v4(),
			enhancer: new UserStoreEnhancer({
				id: uuid.v4(),
				code: defaultCode
			})
		});

		const project = new Project({
			name: init.name,
			pages: [],
			path: init.path,
			patternLibraries: [Project.createBuiltinPatternLibrary()],
			userStore
		});

		project.addPage(
			Page.create(
				{
					active: true,
					id: uuid.v4(),
					name: 'Untitled Page'
				},
				{ project }
			)
		);

		userStore.getPageProperty().setProject(project);
		return project;
	}

	public static from(serialized: Types.SerializedProject): Project {
		const userStore = UserStore.from(serialized.userStore);

		const project = new Project({
			id: serialized.id,
			name: serialized.name,
			path: serialized.path,
			pages: [],
			patternLibraries: serialized.patternLibraries.map(p => PatternLibrary.from(p)),
			userStore,
			focusedItemType: deserializeItemType(serialized.focusedItemType)
		});

		serialized.pages.forEach(page => project.addPage(Page.from(page, { project })));

		serialized.elements.forEach(element =>
			project.addElement(Element.from(element, { project }))
		);

		serialized.elementContents.forEach(elementContent =>
			project.addElementContent(ElementContent.from(elementContent, { project }))
		);

		serialized.elementActions.forEach(elementAction => {
			project.addElementAction(ElementAction.from(elementAction, { userStore }));
		});

		userStore.getPageProperty().setProject(project);
		return project;
	}

	public static equals(a: Types.SavedProject, b: Types.SavedProject): boolean;
	public static equals(a: Types.SavedProject | Project, b: Types.SavedProject | Project): boolean {
		const toData = input => (input instanceof Project ? input.toDisk() : input);
		return _.isEqual(toData(a), toData(b));
	}

	@Mobx.action
	public addElement(element: Element): void {
		element.setProject(this);
		this.elements.set(element.getId(), element);
	}

	@Mobx.action
	public addElementAction(action: ElementAction): void {
		this.elementActions.set(action.getId(), action);
	}

	@Mobx.action
	public addElementContent(elementContent: ElementContent): void {
		elementContent.setProject(this);
		this.elementContents.set(elementContent.getId(), elementContent);
	}

	@Mobx.action
	public addPatternLibrary(patternLibrary: PatternLibrary): void {
		this.patternLibraries.set(patternLibrary.getId(), patternLibrary);
	}

	@Mobx.action
	public addPage(page: Page): void {
		this.pages.push(page);
		page.setProject(this);
	}

	public getBuiltinPatternLibrary(): PatternLibrary {
		return this.getPatternLibraries().find(
			p => p.getOrigin() === Types.PatternLibraryOrigin.BuiltIn
		) as PatternLibrary;
	}

	public getElementActionById(id: string): undefined | ElementAction {
		return this.elementActions.get(id);
	}

	public getElementActions(): ElementAction[] {
		return [...this.elementActions.values()];
	}

	public getElementById(id: string): undefined | Element {
		return this.elements.get(id);
	}

	public getElementContentById(id: string): undefined | ElementContent {
		return this.elementContents.get(id);
	}

	public getElementContents(): ElementContent[] {
		return [...this.elementContents.values()];
	}

	public getElements(): Element[] {
		return [...this.elements.values()];
	}

	public getElementsByPattern(pattern: Pattern): Element[] {
		return this.getElements().filter(e => e.hasPattern(pattern));
	}

	public getFocusedItem(): Element | Page | undefined {
		switch (this.focusedItemType) {
			case Types.ItemType.Element:
				return this.getElements().find(element => element.getFocused());
			case Types.ItemType.Page:
				return this.getPages().find(page => page.getFocused());
			default:
				return;
		}
	}

	public getFocusedItemType(): Types.ItemType {
		return this.focusedItemType;
	}

	public getId(): string {
		return this.id;
	}

	public getName(): string {
		return this.name;
	}

	public getNextPage(): Page | undefined {
		const page = this.pages.find(p => p.getActive());

		if (!page) {
			return;
		}

		const nextIndex = this.getPageIndex(page) + 1;

		if (typeof nextIndex !== 'number' || Number.isNaN(nextIndex)) {
			return;
		}

		if (nextIndex < 0 || nextIndex > this.pages.length - 1) {
			return;
		}

		return this.pages[nextIndex];
	}

	public getPageById(id: string): Page | undefined {
		return this.pages.find(page => page.getId() === id);
	}

	public getPageIndex(page: Page): number {
		return this.pages.indexOf(page);
	}

	public getPages(): Page[] {
		return this.pages;
	}

	public getPath(): string {
		return this.path;
	}

	public getPatternById(id: string): Pattern | undefined {
		return this.patterns.find(p => p.getId() === id);
	}

	public getPatternLibraries(): PatternLibrary[] {
		return [...this.patternLibraries.values()];
	}

	public getPatternLibraryById(id: string): PatternLibrary | undefined {
		return this.patternLibraries.get(id);
	}

	public getPatternPropertyById(id: string): AnyPatternProperty | undefined {
		return this.patternProperties.find(p => p.getId() === id);
	}

	public getPatternSearch(): PatternSearch {
		return this.patternSearch;
	}

	public getPatternSlotById(id: string): PatternSlot | undefined {
		return this.patternSlots.find(p => p.getId() === id);
	}

	public getPreviousPage(): Page | undefined {
		const page = this.pages.find(p => p.getActive());

		if (!page) {
			return;
		}

		const previousIndex = this.getPageIndex(page) - 1;

		if (typeof previousIndex !== 'number' || Number.isNaN(previousIndex)) {
			return;
		}

		if (previousIndex < 0 || previousIndex > this.pages.length - 1) {
			return;
		}

		return this.pages[previousIndex];
	}

	public getUserStore(): UserStore {
		return this.userStore;
	}

	public getElementPropertyById(id: string): ElementProperty | undefined {
		return this.elementProperties.get(id);
	}

	public getElementPropertyByReference(
		reference: UserStoreReference
	): ElementProperty | undefined {
		return this.getElementPropertyById(reference.getElementPropertyId());
	}

	@Mobx.action
	public importElement(element: Element): void {
		element.getDescendants().forEach(descendant => this.importElement(descendant));
		element.getContents().forEach(content => this.addElementContent(content));
		this.addElement(element);
	}

	@Mobx.action
	public importPage(page: Page): void {
		const rootElement = page.getRoot();

		if (rootElement) {
			this.importElement(rootElement);
		}

		this.addPage(page);
	}

	@Mobx.action
	public movePageAfter(opts: { page: Page; targetPage: Page }): void {
		const targetAvailable = this.pages.some(p => p.getId() === opts.targetPage.getId());

		if (!targetAvailable) {
			return;
		}

		const index = this.pages.findIndex(p => opts.page.getId() === p.getId());

		if (index > -1) {
			this.pages.splice(index, 1);
		}

		const targetIndex = this.pages.findIndex(p => opts.targetPage.getId() === p.getId());
		this.pages.splice(targetIndex + 1, 0, opts.page);
	}

	@Mobx.action
	public removeElement(element: Element): void {
		this.elements.delete(element.getId());

		element.getContents().forEach(content => {
			this.removeElementContent(content);
		});
	}

	@Mobx.action
	public removeElementAction(elementAction: ElementAction): void {
		this.elementActions.delete(elementAction.getId());
	}

	@Mobx.action
	public removeElementContent(elementContent: ElementContent): void {
		elementContent.getElements().forEach(element => {
			this.removeElement(element);
		});

		this.elementContents.delete(elementContent.getId());
	}

	@Mobx.action
	public removePage(page: Page): boolean {
		const index = this.pages.indexOf(page);

		if (index === -1) {
			return false;
		}

		this.pages.splice(index, 1);

		return true;
	}

	@Mobx.action
	public setActivePage(page: Page): void {
		this.unsetActivePage();
		this.unsetSelectedElement();

		page.setActive(true);
		this.setFocusedItem(Types.ItemType.Page, page);
	}

	@Mobx.action
	public setActivePageById(id: string): void {
		const page = this.getPageById(id);

		if (!page) {
			return;
		}

		return this.setActivePage(page);
	}

	@Mobx.action
	public setActivePageByIndex(index: number): void {
		if (index < 0 || index > this.pages.length - 1) {
			return;
		}

		const page = this.pages[index];

		if (!page) {
			return;
		}

		this.setActivePage(page);
	}

	@Mobx.action
	public setFocusedItem(type: Types.ItemType, payload: Element | Page | undefined): void {
		const previousFocusItem = this.getFocusedItem();

		if (previousFocusItem) {
			previousFocusItem.setFocused(false);
		}
		this.focusedItemType = type;
		if (payload) {
			payload.setFocused(true);
		}
	}

	@Mobx.action
	public setId(id: string): void {
		this.id = name;
	}

	@Mobx.action
	public setName(name: string): void {
		this.name = name;
	}

	@Mobx.action
	public setPages(pages: Page[]): void {
		this.pages = pages;
	}

	@Mobx.action
	public setPath(path: string): void {
		this.path = path;
	}

	@Mobx.action
	public setHighlightedElement(element: Element): void {
		this.unsetHighlightedElement();
		element.setHighlighted(true);
	}

	@Mobx.action
	public setSelectedElement(element: Element): void {
		this.unsetSelectedElement();
		element.setSelected(true);
	}

	public toDisk(): Types.SavedProject {
		const data = this.toJSON();
		data.elements = this.getElements().map(e => e.toDisk());
		return data;
	}

	public toJSON(): Types.SerializedProject {
		return {
			elements: this.getElements().map(e => e.toJSON()),
			elementActions: this.getElementActions().map(e => e.toJSON()),
			elementContents: this.getElementContents().map(e => e.toJSON()),
			focusedItemType: serializeItemType(this.focusedItemType),
			id: this.id,
			name: this.name,
			pages: this.pages.map(p => p.toJSON()),
			path: this.path,
			patternLibraries: this.getPatternLibraries().map(p => p.toJSON()),
			userStore: this.userStore.toJSON()
		};
	}

	public toString(): string {
		return JSON.stringify(this.toJSON());
	}

	@Mobx.action
	public unsetActivePage(): void {
		this.pages.forEach(page => page.setActive(false));
	}

	@Mobx.action
	public unsetSelectedElement(options?: { ignore: Element }): void {
		this.selectedElements
			.filter(element => !options || options.ignore.getId() !== element.getId())
			.forEach(selectedElement => selectedElement.setSelected(false));
	}

	@Mobx.action
	public unsetDraggedElements(options?: { ignore: Element }): void {
		this.draggedElements
			.filter(element => !options || options.ignore.getId() !== element.getId())
			.forEach(element => element.setDragged(false));
	}

	@Mobx.action
	public unsetHighlightedElement(options?: { ignore: Element }): void {
		this.highlightedElements
			.filter(element => !options || options.ignore.getId() !== element.getId())
			.forEach(selectedElement => selectedElement.setHighlighted(false));
	}

	@Mobx.action
	public unsetHighlightedElementContent(options?: { ignore: ElementContent }): void {
		this.highlightedElementContents
			.filter(elementContent => !options || options.ignore.getId() !== elementContent.getId())
			.forEach(elementContent => elementContent.setHighlighted(false));
	}

	@Mobx.action
	public unsetPlaceholderHighlightedElement(options?: { ignore: Element }): void {
		this.placeholderHighlightedElements
			.filter(element => !options || options.ignore.getId() !== element.getId())
			.forEach(element => element.setPlaceholderHighlighted(false));
	}
}

function serializeItemType(type: Types.ItemType): Types.SerializedItemType {
	switch (type) {
		case Types.ItemType.None:
			return 'none';
		case Types.ItemType.Element:
			return 'element';
		case Types.ItemType.Page:
			return 'page';
	}
}

function deserializeItemType(type: Types.SerializedItemType): Types.ItemType {
	switch (type) {
		case 'none':
			return Types.ItemType.None;
		case 'element':
			return Types.ItemType.Element;
		case 'page':
			return Types.ItemType.Page;
	}
}
