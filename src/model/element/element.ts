import { ElementContent } from './element-content';
import { ElementProperty } from './element-property';
import * as Mobx from 'mobx';
import { Page } from '../page';
import { Pattern } from '../pattern';
import { PatternLibrary } from '../pattern-library';
import { Project } from '../project';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface ElementInit {
	containerId?: string;
	contentIds: string[];
	id?: string;
	name?: string;
	open: boolean;
	patternId: string;
	properties: ElementProperty[];
	setDefaults?: boolean;
}

export interface ElementContext {
	patternLibrary: PatternLibrary;
	project: Project;
}

export class Element {
	private containerId?: string;

	@Mobx.observable private contentIds: string[] = [];

	@Mobx.observable private editedName: string;

	@Mobx.observable private id: string;

	@Mobx.observable private name: string;

	@Mobx.observable private nameEditable: boolean = false;

	@Mobx.observable private open: boolean;

	private page?: Page;

	private parent: Element;

	private patternId: string;

	private patternLibrary: PatternLibrary;

	private project: Project;

	private properties: ElementProperty[];

	public constructor(init: ElementInit, context: ElementContext) {
		this.id = init.id ? init.id : uuid.v4();
		this.patternId = init.patternId;
		this.containerId = init.containerId;
		this.open = init.open;
		this.patternLibrary = context.patternLibrary;
		this.project = context.project;

		const pattern = this.patternLibrary.getPatternById(this.patternId);

		this.contentIds = init.contentIds;

		if (typeof init.name !== 'undefined') {
			this.name = init.name;
		}

		if (this.name === undefined && pattern) {
			this.name = pattern.getName();
		}

		const getProperties = () => {
			if (!pattern) {
				return [];
			}
			return pattern.getProperties().map(patternProperty => {
				const hydratedProperty = init.properties.find(elementProperty =>
					elementProperty.hasPatternProperty(patternProperty)
				);

				if (hydratedProperty) {
					return hydratedProperty;
				}

				return new ElementProperty(
					{
						id: uuid.v4(),
						patternPropertyId: patternProperty.getId(),
						setDefault: Boolean(init.setDefaults),
						value: undefined
					},
					{
						patternLibrary: this.patternLibrary
					}
				);
			});
		};

		this.properties = getProperties();
	}

	public static from(serialized: Types.SerializedElement, context: ElementContext): Element {
		return new Element(
			{
				id: serialized.id,
				name: serialized.name,
				patternId: serialized.patternId,
				containerId: serialized.containerId,
				contentIds: serialized.contentIds,
				open: serialized.open,
				properties: serialized.properties.map(p =>
					ElementProperty.from(p, { patternLibrary: context.patternLibrary })
				)
			},
			context
		);
	}

	public addChild(child: Element, slotId: string, index: number): void {
		child.setParent({
			parent: this,
			slotId,
			index
		});
	}

	public clone(): Element {
		const clonedContents = this.contentIds
			.map(contentId => this.project.getElementContentById(contentId))
			.filter((content): content is ElementContent => typeof content !== 'undefined')
			.map(content => content.clone());

		const clone = new Element(
			{
				id: uuid.v4(),
				containerId: undefined,
				contentIds: clonedContents.map(content => content.getId()),
				name: this.name,
				open: false,
				patternId: this.patternId,
				properties: this.properties.map(propertyValue => propertyValue.clone())
			},
			{
				patternLibrary: this.patternLibrary,
				project: this.project
			}
		);

		clonedContents.forEach(clonedContent => {
			clonedContent.setParentElement(clone);
			this.project.addElementContent(clonedContent);
		});

		this.project.addElement(clone);
		return clone;
	}

	public getContainer(): ElementContent | undefined {
		if (!this.containerId) {
			return;
		}
		return this.project.getElementContentById(this.containerId);
	}

	public getContainerType(): undefined | Types.SlotType {
		const container = this.getContainer();

		if (!container) {
			return;
		}

		return container.getSlotType();
	}

	public getContentById(contentId: string): ElementContent | undefined {
		let result;

		for (const content of this.getContents()) {
			if (content.getId() === contentId) {
				result = content;
				break;
			}

			for (const element of content.getElements()) {
				result = element.getContentById(contentId);

				if (result) {
					break;
				}
			}

			if (result) {
				break;
			}
		}

		return result;
	}

	public getContentBySlotId(slotId: string): ElementContent | undefined {
		return this.getContents().find(content => content.getSlotId() === slotId);
	}

	public getContentBySlotType(slotType: Types.SlotType): ElementContent | undefined {
		return this.getContents().find(content => content.getSlotType() === slotType);
	}

	public getContents(): ElementContent[] {
		return this.contentIds
			.map(contentId => this.project.getElementContentById(contentId))
			.filter(
				(elementContent): elementContent is ElementContent =>
					typeof elementContent !== 'undefined'
			);
	}

	public getDescendants(): Element[] {
		return this.getContents().reduce((acc, content) => [...acc, ...content.getDescendants()], []);
	}

	public getElementById(id: string): Element | undefined {
		let result;

		if (this.id === id) {
			return this;
		}

		for (const content of this.getContents()) {
			for (const element of content.getElements()) {
				result = element.getElementById(id);

				if (result) {
					break;
				}
			}

			if (result) {
				break;
			}
		}

		return result;
	}

	public getId(): string {
		return this.id;
	}

	public getIndex(): number {
		const container = this.getContainer();

		if (!container) {
			return -1;
		}

		return container.getElementIndexById(this.getId());
	}

	public getName(opts?: { unedited: boolean }): string {
		if ((!opts || !opts.unedited) && this.nameEditable) {
			return this.editedName;
		}

		return this.name;
	}

	public getOpen(): boolean {
		return this.open;
	}

	public getPage(): Page | undefined {
		if (this.page) {
			return this.page;
		}

		if (this.parent) {
			return this.parent.getPage();
		}

		return;
	}

	public getParent(): Element | undefined {
		const container = this.getContainer();

		if (!container) {
			return;
		}

		const containerParentId = container.getParentElementId();

		if (!containerParentId) {
			return;
		}

		return this.project.getElementById(containerParentId);
	}

	public getPattern(): Pattern | undefined {
		return this.patternLibrary.getPatternById(this.patternId);
	}

	public getProperties(): ElementProperty[] {
		return this.properties;
	}

	public isAncestorOfById(id: string): boolean {
		const match = this.getElementById(id);
		return Boolean(match);
	}

	public isNameEditable(): boolean {
		return this.nameEditable;
	}

	public isRoot(): boolean {
		return !Boolean(this.getContainer());
	}

	public remove(): void {
		const container = this.getContainer();

		if (container) {
			container.remove({ element: this });
		}
	}

	public setContainer(container: ElementContent): void {
		this.containerId = container.getId();
	}

	public setIndex(index: number): void {
		const container = this.getContainer();

		if (!container) {
			return;
		}

		this.setParent({
			parent: this.parent,
			slotId: container.getSlotId(),
			index
		});
	}

	public setName(name: string): void {
		if (this.nameEditable) {
			this.editedName = name;
		} else {
			this.name = name;
		}
	}

	public setNameEditable(nameEditable: boolean): void {
		if (nameEditable) {
			this.editedName = this.name;
		} else {
			this.name = this.editedName || this.name;
		}

		this.nameEditable = nameEditable;
	}

	public setOpen(open: boolean): void {
		this.open = open;
	}

	public setPage(page: Page): void {
		this.page = page;
	}

	public setParent(init: { index: number; parent: Element; slotId: string }): void {
		const previousContainer = this.getContainer();

		if (previousContainer) {
			previousContainer.remove({ element: this });
		}

		const container = init.parent.getContentBySlotId(init.slotId);

		if (container) {
			container.insert({ element: this, at: init.index });
			this.setContainer(container);
		}
	}

	public toggleOpen(): void {
		this.setOpen(!this.getOpen());
	}

	public toJSON(): Types.SerializedElement {
		return {
			containerId: this.containerId,
			contentIds: Array.from(this.contentIds),
			id: this.id,
			name: this.name,
			open: this.open,
			patternId: this.patternId,
			properties: this.properties.map(elementProperty => elementProperty.toJSON())
		};
	}

	public unsetContainer(): void {
		this.containerId = undefined;
	}
}
