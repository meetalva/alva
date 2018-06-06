import { Element, ElementContent } from './element';
import { ElementAction } from './element-action';
import { isEqual } from 'lodash';
import * as Mobx from 'mobx';
import { Page } from './page';
import { PatternLibrary } from './pattern-library';
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
	patternLibrary: PatternLibrary;
	userStore: UserStore;
}

export interface ProjectCreateInit {
	name: string;
	path: string;
}

export class Project {
	@Mobx.observable private elements: Element[] = [];

	@Mobx.observable private elementActions: ElementAction[] = [];

	@Mobx.observable private elementContents: ElementContent[] = [];

	@Mobx.observable private id: string;

	@Mobx.observable private name: string;

	@Mobx.observable private pages: Page[] = [];

	@Mobx.observable private path;

	@Mobx.observable private patternLibrary: PatternLibrary;

	@Mobx.observable private userStore: UserStore;

	/**
	 * Creates a new project.
	 * @param id The technical (internal) ID of the project.
	 * @param name The human-friendly name of the project.
	 */
	public constructor(init: ProjectProperties) {
		this.patternLibrary = init.patternLibrary;
		this.name = init.name;

		this.id = init.id ? init.id : uuid.v4();
		this.pages = init.pages ? init.pages : [];
		this.path = init.path;
		this.userStore = init.userStore;
	}

	public static create(init: ProjectCreateInit): Project {
		const patternLibrary = PatternLibrary.create({
			getGloablEnumOptionId: () => uuid.v4(),
			getGlobalPatternId: () => uuid.v4(),
			getGlobalPropertyId: () => uuid.v4(),
			getGlobalSlotId: () => uuid.v4()
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
			actions: [noopAction, navigatePageAction /*, setPropertyAction*/]
		});

		const project = new Project({
			name: init.name,
			pages: [],
			path: init.path,
			patternLibrary,
			userStore
		});

		project.addPage(
			Page.create(
				{
					active: true,
					id: uuid.v4(),
					name: 'Untitled Page',
					patternLibrary
				},
				{ project, patternLibrary }
			)
		);

		return project;
	}

	/**
	 * Loads and returns a project from a given JSON object.
	 * @param jsonObject The JSON object to load from.
	 * @return A new project object containing the loaded data.
	 */
	public static from(serialized: Types.SerializedProject): Project {
		const patternLibrary = PatternLibrary.from(serialized.patternLibrary);
		const userStore = UserStore.from(serialized.userStore);

		const project = new Project({
			id: serialized.id,
			name: serialized.name,
			path: serialized.path,
			pages: [],
			patternLibrary,
			userStore
		});

		serialized.pages.forEach(page =>
			project.addPage(Page.from(page, { patternLibrary, project }))
		);

		serialized.elements.forEach(element =>
			project.addElement(Element.from(element, { patternLibrary, project }))
		);

		serialized.elementContents.forEach(elementContent =>
			project.addElementContent(ElementContent.from(elementContent, { patternLibrary, project }))
		);

		serialized.elementActions.forEach(elementAction => {
			project.addElementAction(ElementAction.from(elementAction));
		});

		return project;
	}

	public static isEqual(a: Types.SavedProject, b: Types.SavedProject): boolean;
	public static isEqual(
		a: Types.SavedProject | Project,
		b: Types.SavedProject | Project
	): boolean {
		const toData = input => (input instanceof Project ? input.toDisk() : input);
		return isEqual(toData(a), toData(b));
	}

	public addElement(element: Element): void {
		this.elements.push(element);
	}

	public addElementAction(action: ElementAction): void {
		this.elementActions.push(action);
	}

	public addElementContent(elementContent: ElementContent): void {
		this.elementContents.push(elementContent);
	}

	public addPage(page: Page): void {
		this.pages.push(page);
	}

	public getElementActionById(id: string): undefined | ElementAction {
		return this.elementActions.find(e => e.getId() === id);
	}

	public getElementActions(): ElementAction[] {
		return this.elementActions;
	}

	public getElementById(id: string): undefined | Element {
		return this.elements.find(e => e.getId() === id);
	}

	public getElementContentById(id: string): undefined | ElementContent {
		return this.elementContents.find(e => e.getId() === id);
	}

	public getElementContents(): ElementContent[] {
		return this.elementContents;
	}

	public getElements(): Element[] {
		return this.elements;
	}

	public getId(): string {
		return this.id;
	}

	public getName(): string {
		return this.name;
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

	public getPatternLibrary(): PatternLibrary {
		return this.patternLibrary;
	}

	public getUserStore(): UserStore {
		return this.userStore;
	}

	public removePage(page: Page): boolean {
		const index = this.pages.indexOf(page);

		if (index === -1) {
			return false;
		}

		this.pages.splice(index, 1);

		return true;
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
	public setPatternLibrary(patternLibrary: PatternLibrary): void {
		this.patternLibrary = patternLibrary;
		this.elements.forEach(e => e.setPatternLibrary({ patternLibrary, project: this }));
		this.elementContents.forEach(e => e.setPatternLibrary(this.patternLibrary));
	}

	public toDisk(): Types.SavedProject {
		const data = this.toJSON();
		data.elements = this.elements.map(e => e.toDisk());
		return data;
	}

	public toJSON(): Types.SerializedProject {
		return {
			elements: this.elements.map(e => e.toJSON()),
			elementActions: this.elementActions.map(e => e.toJSON()),
			elementContents: this.elementContents.map(e => e.toJSON()),
			id: this.id,
			name: this.name,
			pages: this.pages.map(p => p.toJSON()),
			path: this.path,
			patternLibrary: this.patternLibrary.toJSON(),
			userStore: this.userStore.toJSON()
		};
	}

	public toString(): string {
		return JSON.stringify(this.toJSON());
	}
}
