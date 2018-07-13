import { Element, ElementContent } from './element';
import { ElementAction } from './element-action';
import * as Mobx from 'mobx';
import * as _ from 'lodash';
import { Page } from './page';
import { PatternSearch } from './pattern-search';
import { Pattern, PatternSlot } from './pattern';
import { PatternLibrary } from './pattern-library';
import { AnyPatternProperty } from './pattern-property';
import * as Types from '../types';
import { UserStore } from './user-store';
import { UserStoreAction } from './user-store-action';
import { UserStoreProperty } from './user-store-property';
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
}

export interface ProjectCreateInit {
	name: string;
	path: string;
}

export class Project {
	@Mobx.observable private elements: Map<string, Element> = new Map();

	@Mobx.observable private elementActions: Map<string, ElementAction> = new Map();

	@Mobx.observable private elementContents: Map<string, ElementContent> = new Map();

	@Mobx.observable private focusedItemType: Types.FocusedItemType;

	@Mobx.observable private id: string;

	@Mobx.observable private name: string;

	@Mobx.observable private pages: Page[] = [];

	@Mobx.observable private path;

	@Mobx.observable private patternLibraries: Map<string, PatternLibrary> = new Map();

	@Mobx.observable private userStore: UserStore;

	@Mobx.computed
	private get patternSearch(): PatternSearch {
		return new PatternSearch({
			patterns: this.getPatternLibraries().reduce((ps, lib) => [...ps, ...lib.getPatterns()], [])
		});
	}

	public constructor(init: ProjectProperties) {
		this.name = init.name;
		this.id = init.id ? init.id : uuid.v4();
		this.pages = init.pages ? init.pages : [];
		this.path = init.path;
		this.userStore = init.userStore;

		init.patternLibraries.forEach(patternLibrary =>
			this.patternLibraries.set(patternLibrary.getId(), patternLibrary)
		);
	}

	public static create(init: ProjectCreateInit): Project {
		const patternLibrary = PatternLibrary.create({
			bundle: '',
			bundleId: '',
			description: 'Basic building blocks available to every new Alva project',
			id: uuid.v4(),
			name: 'Built-In Components',
			origin: Types.PatternLibraryOrigin.BuiltIn,
			patternProperties: [],
			patterns: [],
			state: Types.PatternLibraryState.Connected
		});

		const currentPageProperty = new UserStoreProperty({
			id: uuid.v4(),
			name: 'Current Page',
			payload: '',
			type: Types.UserStorePropertyType.Page
		});

		const noopAction = new UserStoreAction({
			acceptsProperty: false,
			id: uuid.v4(),
			name: 'No Interaction',
			type: Types.UserStoreActionType.Noop
		});

		const navigatePageAction = new UserStoreAction({
			acceptsProperty: false,
			id: uuid.v4(),
			name: 'Switch Page',
			userStorePropertyId: currentPageProperty.getId(),
			type: Types.UserStoreActionType.Set
		});

		const openLinkAction = new UserStoreAction({
			acceptsProperty: false,
			id: uuid.v4(),
			name: 'Navigate',
			userStorePropertyId: undefined,
			type: Types.UserStoreActionType.OpenExternal
		});

		// TODO: Reenable when implementing full variable support
		/* const setPropertyAction = new UserStoreAction({
			acceptsProperty: true,
			id: uuid.v4(),
			name: 'Set Variable',
			type: Types.UserStoreActionType.Set
		}); */

		const userStore = new UserStore({
			id: uuid.v4(),
			properties: [currentPageProperty],
			actions: [noopAction, navigatePageAction, openLinkAction /*, setPropertyAction*/]
		});

		const project = new Project({
			name: init.name,
			pages: [],
			path: init.path,
			patternLibraries: [patternLibrary],
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

		currentPageProperty.setProject(project);

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
			userStore
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
		this.elements.set(element.getId(), element);
	}

	@Mobx.action
	public addElementAction(action: ElementAction): void {
		this.elementActions.set(action.getId(), action);
	}

	@Mobx.action
	public addElementContent(elementContent: ElementContent): void {
		this.elementContents.set(elementContent.getId(), elementContent);
	}

	@Mobx.action
	public addPatternLibrary(patternLibrary: PatternLibrary): void {
		this.patternLibraries.set(patternLibrary.getId(), patternLibrary);
		// this.patternLibrary = patternLibrary;
		// this.elements.forEach(e => e.setPatternLibrary({ patternLibrary, project: this }));
		// this.elementContents.forEach(e => e.setPatternLibrary(this.patternLibrary));
	}

	@Mobx.action
	public addPage(page: Page): void {
		this.pages.push(page);
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
		if (this.focusedItemType === Types.FocusedItemType.Element) {
			return this.getElements().find(element => element.getFocused());
		} else if (this.focusedItemType === Types.FocusedItemType.Page) {
			return this.getPages().find(page => page.getFocused());
		} else {
			return undefined;
		}
	}

	public getFocusedItemType(): Types.FocusedItemType {
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
		return this.getPatternLibraries().reduce((result, lib) => {
			if (typeof result !== 'undefined') {
				return result;
			}
			return lib.getPatternById(id);
		}, undefined);
	}

	public getPatternLibraries(): PatternLibrary[] {
		return [...this.patternLibraries.values()];
	}

	public getPatternLibraryById(id: string): PatternLibrary | undefined {
		return this.patternLibraries.get(id);
	}

	public getPatternPropertyById(id: string): AnyPatternProperty | undefined {
		return this.getPatternLibraries().reduce((result, lib) => {
			if (typeof result !== 'undefined') {
				return result;
			}
			return lib.getPatternPropertyById(id);
		}, undefined);
	}

	public getPatternSearch(): PatternSearch {
		return this.patternSearch;
	}

	public getPatternSlotById(id: string): PatternSlot | undefined {
		return this.getPatternLibraries().reduce((result, lib) => {
			if (typeof result !== 'undefined') {
				return result;
			}
			return lib.getPatternSlotById(id);
		}, undefined);
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
		this.setFocusedItem(Types.FocusedItemType.Page, page);
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
	public setFocusedItem(type: Types.FocusedItemType, payload: Element | Page | undefined): void {
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
		this.getElements()
			.filter(element => element.getSelected())
			.filter(element => !options || options.ignore.getId() !== element.getId())
			.forEach(element => {
				element.setSelected(false);
				element.getAncestors().forEach(ancestor => {
					ancestor.setForcedOpen(false);
				});
			});
	}

	@Mobx.action
	public unsetHighlightedElement(options?: { ignore: Element }): void {
		this.getElements()
			.filter(element => element.getHighlighted())
			.filter(element => !options || options.ignore.getId() !== element.getId())
			.forEach(element => {
				element.setHighlighted(false);
				element.getAncestors().forEach(ancestor => ancestor.setForcedOpen(false));
			});
	}

	@Mobx.action
	public unsetHighlightedElementContent(options?: { ignore: ElementContent }): void {
		this.getElementContents()
			.filter(content => !options || options.ignore.getId() !== content.getId())
			.filter(content => content.getHighlighted())
			.forEach(content => content.setHighlighted(false));
	}
}
