import { Element, ElementContent } from './element';
import * as Mobx from 'mobx';
import { Page } from './page';
import { PatternLibrary } from './pattern-library';
import * as Types from './types';
import * as uuid from 'uuid';

export interface ProjectProperties {
	id?: string;
	lastChangedAuthor?: string;
	lastChangedDate?: Date;
	name: string;
	pages: Page[];
	path: string;
	patternLibrary: PatternLibrary;
}

export interface ProjectCreateInit {
	name: string;
	path: string;
}

export class Project {
	@Mobx.observable private elementContents: ElementContent[] = [];

	@Mobx.observable private elements: Element[] = [];

	@Mobx.observable private id: string;

	@Mobx.observable private lastChangedAuthor: string;

	@Mobx.observable private lastChangedDate: Date = new Date();

	@Mobx.observable private name: string;

	@Mobx.observable private pages: Page[] = [];

	@Mobx.observable private path;

	@Mobx.observable private patternLibrary: PatternLibrary;

	/**
	 * Creates a new project.
	 * @param id The technical (internal) ID of the project.
	 * @param name The human-friendly name of the project.
	 */
	public constructor(properties: ProjectProperties) {
		this.patternLibrary = properties.patternLibrary;
		this.name = properties.name;

		this.id = properties.id ? properties.id : uuid.v4();
		this.lastChangedAuthor = properties.lastChangedAuthor || 'unknown';
		this.lastChangedDate = properties.lastChangedDate || new Date();

		this.pages = properties.pages ? properties.pages : [];
		this.path = properties.path;
	}

	public static create(init: ProjectCreateInit): Project {
		const patternLibrary = PatternLibrary.create({
			getGloablEnumOptionId: () => uuid.v4(),
			getGlobalPatternId: () => uuid.v4(),
			getGlobalPropertyId: () => uuid.v4(),
			getGlobalSlotId: () => uuid.v4()
		});

		const project = new Project({
			name: init.name,
			pages: [],
			path: init.path,
			patternLibrary
		});

		project.addPage(
			Page.create(
				{
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

		const project = new Project({
			id: serialized.id,
			lastChangedAuthor: serialized.lastChangedAuthor,
			lastChangedDate: serialized.lastChangedDate
				? new Date(serialized.lastChangedDate)
				: undefined,
			name: serialized.name,
			path: serialized.path,
			pages: [],
			patternLibrary
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

		return project;
	}

	public addElement(element: Element): void {
		this.elements.push(element);
	}

	public addElementContent(elementContent: ElementContent): void {
		this.elementContents.push(elementContent);
	}

	public addPage(page: Page): void {
		this.pages.push(page);
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

	/**
	 * The last author who edited this project or one of its pages (including elements,
	 * properties etc.). Updated when calling the touch method.
	 * @see touch()
	 */
	public getLastChangedAuthor(): string {
		return this.lastChangedAuthor;
	}

	/**
	 * The last change date when this project or one of its pages was edited (including elements,
	 * properties etc.). Updated when calling the touch method.
	 * @see touch()
	 */
	public getLastChangedDate(): Date {
		return this.lastChangedDate;
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

	public removePage(page: Page): boolean {
		const index = this.pages.indexOf(page);

		if (index === -1) {
			return false;
		}

		this.pages.splice(index, 1);

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
	public setPatternLibrary(patternLibrary: PatternLibrary): void {
		this.patternLibrary = patternLibrary;
		this.elements.forEach(e => e.setPatternLibrary(this.patternLibrary));
		this.elementContents.forEach(e => e.setPatternLibrary(this.patternLibrary));
	}

	public toDisk(): Types.SavedProject {
		return {
			elementContents: this.elementContents.map(e => e.toJSON()),
			elements: this.elements.map(e => e.toDisk()),
			id: this.id,
			name: this.name,
			lastChangedAuthor: this.lastChangedAuthor,
			lastChangedDate: this.lastChangedDate ? this.lastChangedDate.toJSON() : undefined,
			pages: this.pages.map(p => p.toJSON()),
			patternLibrary: this.patternLibrary.toJSON()
		};
	}

	public toJSON(): Types.SerializedProject {
		return {
			elements: this.elements.map(e => e.toJSON()),
			elementContents: this.elementContents.map(e => e.toJSON()),
			id: this.id,
			name: this.name,
			lastChangedAuthor: this.lastChangedAuthor,
			lastChangedDate: this.lastChangedDate ? this.lastChangedDate.toJSON() : undefined,
			pages: this.pages.map(p => p.toJSON()),
			path: this.path,
			patternLibrary: this.patternLibrary.toJSON()
		};
	}

	public toString(): string {
		return JSON.stringify(this.toJSON());
	}
}
