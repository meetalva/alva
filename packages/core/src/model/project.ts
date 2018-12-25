import { AnyModel } from './any-model';
import { computeDifference } from '../alva-util';
import { Element, ElementContent, ElementProperty } from './element';
import { ElementAction } from './element-action';
import * as Message from '../message';
import * as Mobx from 'mobx';
import * as _ from 'lodash';
import { Page } from './page';
import { PatternSearch } from './pattern-search';
import { Pattern, PatternSlot } from './pattern';
import { PatternLibrary, PatternLibraryCreateOptions } from './pattern-library';
import { AnyPatternProperty } from './pattern-property';
import * as Types from '../types';
import { UserStore } from './user-store';
import { UserStoreEnhancer, defaultCode, defaultJavaScript } from './user-store-enhancer';
import { UserStoreReference } from './user-store-reference';
import * as uuid from 'uuid';
import * as ModelTree from '../model-tree';

export interface ProjectProperties {
	draft: boolean;
	id?: string;
	name: string;
	pages: Page[];
	path: string;
	patternLibraries: PatternLibrary[];
	userStore: UserStore;
}

export interface ProjectCreateInit {
	name: string;
	draft: boolean;
	path: string;
}

export class Project {
	public readonly model = Types.ModelName.Project;

	private syncing: boolean = false;

	@Mobx.observable private draft: boolean;

	@Mobx.observable private elements: Map<string, Element> = new Map();

	@Mobx.observable private elementActions: Map<string, ElementAction> = new Map();

	@Mobx.observable private elementContents: Map<string, ElementContent> = new Map();

	@Mobx.observable private id: string;

	@Mobx.observable private name: string;

	@Mobx.observable private internalPages: Map<string, Page> = new Map();

	@Mobx.observable private pageList: string[] = [];

	@Mobx.observable private path: string;

	@Mobx.observable private patternLibraries: Map<string, PatternLibrary> = new Map();

	@Mobx.observable private userStore: UserStore;

	@Mobx.computed
	private get activePage(): Page {
		return this.pages.find(p => p.getActive()) || this.pages[0];
	}

	@Mobx.computed
	private get patterns(): Pattern[] {
		return this.getPatternLibraries().reduce<Pattern[]>(
			(ps, lib) => [...ps, ...lib.getPatterns()],
			[]
		);
	}

	@Mobx.computed
	private get patternProperties(): AnyPatternProperty[] {
		return this.getPatternLibraries().reduce<AnyPatternProperty[]>(
			(ps, lib) => [...ps, ...lib.getPatternProperties()],
			[]
		);
	}

	@Mobx.computed
	private get patternSlots(): PatternSlot[] {
		return this.getPatternLibraries().reduce<PatternSlot[]>(
			(ps, lib) => [...ps, ...lib.getSlots()],
			[]
		);
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

	@Mobx.computed
	private get focusedItem(): Element | Page | undefined {
		const element = this.getElements().find(e => e.getFocused());

		if (element) {
			return element;
		}

		const page = this.getPages().find(p => p.getFocused());

		if (page) {
			return page;
		}

		return;
	}

	@Mobx.computed
	private get focusedItemType(): Types.ItemType {
		if (this.focusedItem instanceof Page) {
			return Types.ItemType.Page;
		}

		if (this.focusedItem instanceof Element) {
			return Types.ItemType.Element;
		}

		return Types.ItemType.None;
	}

	@Mobx.computed
	private get pages(): Page[] {
		return [...this.internalPages.values()]
			.filter(p => this.pageList.includes(p.getId()))
			.sort((a, b) => this.pageList.indexOf(a.getId()) - this.pageList.indexOf(b.getId()));
	}

	public constructor(init: ProjectProperties) {
		this.name = init.name;
		this.id = init.id ? init.id : uuid.v4();
		this.path = init.path;
		this.userStore = init.userStore;
		this.draft = init.draft;

		init.pages.forEach(page => {
			this.addPage(page);
		});

		init.patternLibraries.forEach(patternLibrary => {
			this.addPatternLibrary(patternLibrary);
		});
	}

	public static createBuiltinPatternLibrary(opts?: PatternLibraryCreateOptions): PatternLibrary {
		return PatternLibrary.create(
			{
				bundle: '',
				bundleId: '',
				description: 'Built-in components for basic layouts and logic',
				id: uuid.v4(),
				version: '1.0.0',
				name: 'Essentials',
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
				typeScript: defaultCode,
				javaScript: defaultJavaScript
			})
		});

		const project = new Project({
			name: init.name,
			pages: [],
			path: init.path,
			patternLibraries: [Project.createBuiltinPatternLibrary()],
			userStore,
			draft: init.draft
		});

		project.addPage(
			Page.create(
				{
					active: true,
					id: uuid.v4(),
					name: 'Page 1'
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
			draft: Boolean(serialized.draft),
			id: serialized.id,
			name: serialized.name,
			path: serialized.path,
			pages: [],
			patternLibraries: [],
			userStore
		});

		serialized.patternLibraries.forEach(p => project.addPatternLibrary(PatternLibrary.from(p)));

		// Legacy bridge: Use page array order if no pagelist is found
		const pageList = serialized.pageList || serialized.pages.map(p => p.id);

		serialized.pages
			.sort((a, b) => pageList.indexOf(a.id) - pageList.indexOf(b.id))
			.forEach(page => project.addPage(Page.from(page, { project })));

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

	public static toResult(
		serialized: Types.SerializedProject
	):
		| { status: Types.ProjectStatus.Ok; result: Project }
		| { status: Types.ProjectStatus.Error; error: Error } {
		try {
			return {
				status: Types.ProjectStatus.Ok,
				result: Project.from(serialized)
			};
		} catch (error) {
			return {
				status: Types.ProjectStatus.Error,
				error
			};
		}
	}

	public static fromResult(
		result: Types.PersistenceParseResult<Types.SerializedProject>
	):
		| { status: Types.ProjectStatus.Ok; result: Project }
		| { status: Types.ProjectStatus.Error; error: Error } {
		if (result.state === Types.PersistenceState.Error) {
			return { status: Types.ProjectStatus.Error, error: result.error };
		}

		return Project.toResult(result.contents);
	}

	public static equals(a: Types.SavedProject, b: Types.SavedProject): boolean;
	public static equals(a: Types.SavedProject | Project, b: Types.SavedProject | Project): boolean {
		const toData = (input: Types.SavedProject | Project) =>
			input instanceof Project ? input.toDisk() : input;
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
	public addPatternLibrary(lib: PatternLibrary): void {
		if (lib.getOrigin() === Types.PatternLibraryOrigin.BuiltIn) {
			const updatedLibrary = Project.createBuiltinPatternLibrary({
				getGlobalEnumOptionId: lib.assignEnumOptionId.bind(lib),
				getGlobalPatternId: lib.assignPatternId.bind(lib),
				getGlobalPropertyId: lib.assignPropertyId.bind(lib),
				getGlobalSlotId: lib.assignSlotId.bind(lib)
			});

			lib.update(updatedLibrary);
		}

		this.patternLibraries.set(lib.getId(), lib);
	}

	@Mobx.action
	public addPage(page: Page): void {
		this.internalPages.set(page.getId(), page);
		this.pageList.push(page.getId());
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

	public getHighlightedElements(): Element[] {
		return this.highlightedElements;
	}

	public getHighlightedElementContents(): ElementContent[] {
		return this.highlightedElementContents;
	}

	public getItem(
		id: string,
		type: Types.ItemType | Types.SerializedItemType
	): Element | Page | undefined {
		switch (type) {
			case Types.ItemType.Page:
			case 'page':
				return this.getPageById(id);
			case Types.ItemType.Element:
			case 'element':
				return this.getElementById(id);
			default:
				return;
		}
	}

	public getFocusedItem(): Element | Page | undefined {
		return this.focusedItem;
	}

	public getFocusedItemType(): Types.ItemType {
		return this.focusedItemType;
	}

	public getId(): string {
		return this.path
			? Buffer.from([this.id, this.path].join(':'), 'utf-8').toString('base64')
			: this.id;
	}

	public getName(): string {
		return this.name;
	}

	public hasFriendlyName(): boolean {
		return this.name !== this.id;
	}

	public getNextPage(): Page | undefined {
		const page = this.pages.find(p => p.getActive());

		if (!page) {
			return;
		}

		const nextIndex = page.getIndex() + 1;

		if (typeof nextIndex !== 'number' || Number.isNaN(nextIndex)) {
			return;
		}

		if (nextIndex < 0 || nextIndex > this.pages.length - 1) {
			return;
		}

		return this.pages[nextIndex];
	}

	public getObject(constructorName: string, id: string): AnyModel | undefined {
		if (constructorName === 'Element') {
			return this.getElementById(id);
		}

		if (constructorName === 'ElementAction') {
			return this.getElementActionById(id);
		}

		if (constructorName === 'ElementContent') {
			return this.getElementContentById(id);
		}

		if (constructorName === 'Page') {
			return this.getPageById(id);
		}

		if (constructorName === 'Pattern') {
			return this.getPatternById(id);
		}

		if (constructorName === 'PatternLibrary') {
			return this.getPatternLibraryById(id);
		}

		if (constructorName === 'Project') {
			return this;
		}

		if (constructorName === 'UserStore') {
			return this.getUserStore();
		}

		if (constructorName === 'UserStoreAction') {
			return this.getUserStore().getActionById(id);
		}

		if (constructorName === 'UserStoreProperty') {
			return this.getUserStore().getPropertyById(id);
		}

		if (constructorName === 'UserStoreEnhancer') {
			return this.getUserStore().getEnhancer();
		}

		if (constructorName === 'UserStoreReference') {
			return this.getUserStore().getReferenceById(id);
		}

		return;
	}

	public getPageById(id: string): Page | undefined {
		return this.pages.find(page => page.getId() === id);
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

	public getPatterns(): Pattern[] {
		return this.patterns;
	}

	public getPatternProperties(): AnyPatternProperty[] {
		return this.patternProperties;
	}

	public getPatternLibraries(): PatternLibrary[] {
		return [...this.patternLibraries.values()];
	}

	public getPatternLibraryById(id: string): PatternLibrary | undefined {
		return this.patternLibraries.get(id);
	}

	public getPatternLibraryByContextId(contextid: string): PatternLibrary | undefined {
		return [...this.patternLibraries.values()].find(p => p.contextId === contextid);
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

		const previousIndex = page.getIndex() - 1;

		if (typeof previousIndex !== 'number' || Number.isNaN(previousIndex)) {
			return;
		}

		if (previousIndex < 0 || previousIndex > this.pages.length - 1) {
			return;
		}

		return this.pages[previousIndex];
	}

	public getSelectedElement(): Element | undefined {
		const selected = this.selectedElements[0];
		return selected ? selected : this.activePage ? this.activePage.getRoot() : undefined;
	}

	public getUserStore(): UserStore {
		return this.userStore;
	}

	public getDraft(): boolean {
		return this.draft;
	}

	public setDraft(draft: boolean): void {
		this.draft = draft;
	}

	public setId(raw: string): void {
		const [id] = Buffer.from(raw, 'base64')
			.toString('utf-8')
			.split(':');
		this.id = id;
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
		this.movePage({ ...opts, offset: 1 });
	}

	@Mobx.action
	public movePageBefore(opts: { page: Page; targetPage: Page }): void {
		this.movePage({ ...opts, offset: 0 });
	}

	@Mobx.action
	public movePage(opts: { page: Page; targetPage: Page; offset: number }): void {
		const targetAvailable = this.pages.some(p => p.getId() === opts.targetPage.getId());
		const pageAvailable = this.pages.some(p => p.getId() === opts.page.getId());

		if (!targetAvailable || !pageAvailable) {
			return;
		}

		const index = this.pages.findIndex(p => opts.page.getId() === p.getId());
		this.pageList.splice(index, 1);

		const targetIndex = this.pages.findIndex(p => opts.targetPage.getId() === p.getId());
		this.pageList.splice(targetIndex + opts.offset, 0, opts.page.getId());
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
	public removePage(page: Page): void {
		this.internalPages.delete(page.getId());

		const index = this.pageList.indexOf(page.getId());

		if (index === -1) {
			return;
		}

		this.pageList.splice(index, 1);
	}

	@Mobx.action
	public removePatternLibrary(patternLibrary: PatternLibrary): void {
		this.patternLibraries.delete(patternLibrary.getId());
	}

	@Mobx.action
	public setActivePage(page: Page): void {
		this.unsetActivePage();
		this.unsetSelectedElement();

		page.setActive(true);
		this.setFocusedItem(page);
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
	public setFocusedItem(payload: Element | Page | undefined): void {
		const previousFocusItem = this.getFocusedItem();

		if (previousFocusItem) {
			previousFocusItem.setFocused(false);
		}

		if (payload) {
			payload.setFocused(true);
		}
	}

	@Mobx.action
	public reArrangePagesIndex(position: number, page: Page): boolean {
		if (position > this.pages.length) {
			return false;
		}

		this.pageList.splice(page.getIndex(), 1);

		this.pageList.splice(position, 0, page.getId());
		return true;
	}

	@Mobx.action
	public setName(name: string): void {
		this.name = name;
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
			draft: this.draft,
			model: this.model,
			elements: this.getElements().map(e => e.toJSON()),
			elementActions: this.getElementActions().map(e => e.toJSON()),
			elementContents: this.getElementContents().map(e => e.toJSON()),
			id: this.id,
			name: this.name,
			pages: this.pages.filter(Boolean).map(p => p.toJSON()),
			pageList: Array.from(this.pageList),
			path: this.path,
			patternLibraries: this.getPatternLibraries().map(p => p.toJSON()),
			userStore: this.userStore.toJSON()
		};
	}

	public getByPath(path: string): any {
		function getByPath(fragments: string[], origin: any): any {
			if (!origin) {
				return;
			}

			const fragment = fragments.shift();

			if (!fragment) {
				return origin;
			}

			if (Mobx.isObservableMap(origin)) {
				return getByPath(fragments, origin.get(fragment));
			}

			return getByPath(fragments, origin[fragment]);
		}

		return getByPath(path.split('/'), this);
	}

	public sync(sender: Types.Sender): void {
		if (this.syncing) {
			return;
		}

		this.syncing = true;

		sender.match<Message.ProjectUpdate>(Message.MessageType.ProjectUpdate, m => {
			this.onProjectUpdate(m);
		});
	}

	public unsync(sender: Types.Sender): void {
		sender.unmatch(Message.MessageType.ProjectUpdate, this.onProjectUpdate);
	}

	private onProjectUpdate(m: Message.ProjectUpdate) {
		const { change, path, projectId } = m.payload;

		if (projectId !== this.getId()) {
			return;
		}

		const target = this.getByPath(path);

		if (Mobx.isObservableMap(target)) {
			const c = change as Mobx.IMapDidChange;

			switch (c.type) {
				case 'add':
				case 'update': {
					const ValueModel =
						typeof c.newValue === 'object'
							? ModelTree.getModelByName(c.newValue.model as Types.ModelName)
							: undefined;

					const value = ValueModel
						? (ValueModel as any).from(c.newValue, { project: this })
						: c.newValue;
					target.set(c.name, value);
					break;
				}
				case 'delete':
					target.delete(c.name);
			}
			return;
		}

		if (Mobx.isObservableObject(target)) {
			const c = change as Mobx.IObjectDidChange;

			switch (c.type) {
				case 'add':
				case 'update': {
					const ValueModel =
						typeof c.newValue === 'object'
							? ModelTree.getModelByName(c.newValue.model as Types.ModelName)
							: undefined;
					const value = ValueModel
						? (ValueModel as any).from(c.newValue, { project: this })
						: c.newValue;
					(target as any)[c.name] = value;
					break;
				}
				case 'remove': {
					delete (target as any)[c.name];
				}
			}
			return;
		}

		if (Mobx.isObservableArray(target) && change.type === 'splice') {
			const c = change as Mobx.IArraySplice;
			target.splice(c.index, c.removedCount, ...c.added);
			return;
		}
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

	public update(b: this): void {
		this.name = b.name;
		this.path = b.path;
		this.userStore.update(b.userStore);

		const elementChanges = computeDifference({
			before: this.getElements(),
			after: b.getElements()
		});

		elementChanges.removed.forEach(change => this.removeElement(change.before));
		elementChanges.added.forEach(change => this.addElement(change.after));
		elementChanges.changed.forEach(change => change.before.update(change.after));

		const elementActionChanges = computeDifference({
			before: this.getElementActions(),
			after: b.getElementActions()
		});

		elementActionChanges.removed.forEach(change => this.removeElementAction(change.before));
		elementActionChanges.added.forEach(change => this.addElementAction(change.after));
		elementActionChanges.changed.forEach(change => change.before.update(change.after));

		const elementContentChanges = computeDifference({
			before: this.getElementContents(),
			after: b.getElementContents()
		});

		elementContentChanges.removed.forEach(change => this.removeElementContent(change.before));
		elementContentChanges.added.forEach(change => this.addElementContent(change.after));
		elementContentChanges.changed.forEach(change => change.before.update(change.after));

		const patternLibraryChanges = computeDifference({
			before: this.getPatternLibraries(),
			after: b.getPatternLibraries()
		});

		patternLibraryChanges.removed.forEach(change => this.removePatternLibrary(change.before));
		patternLibraryChanges.added.forEach(change => this.addPatternLibrary(change.after));
		patternLibraryChanges.changed.forEach(change => change.before.update(change.after));

		const pageChanges = computeDifference({
			before: this.getPages(),
			after: b.getPages()
		});

		pageChanges.removed.forEach(change => this.removePage(change.before));
		pageChanges.added.forEach(change => this.addPage(change.after));
		pageChanges.changed.forEach(change => change.before.update(change.after));

		this.pageList = b.pageList;
	}

	public clone(): Project {
		return Project.from(this.toJSON());
	}
}
