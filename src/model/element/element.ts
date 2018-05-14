import { ElementContent } from './element-content';
import { ElementProperty } from './element-property';
import * as Mobx from 'mobx';
import { Page } from '../page';
import { Pattern, PatternSlot } from '../pattern';
import { PatternLibrary } from '../pattern-library';
import { Project } from '../project';
import * as Types from '../types';
import * as Uuid from 'uuid';

export interface ElementInit {
	container?: ElementContent;
	contents: ElementContent[];
	id?: string;
	name?: string;
	pattern: Pattern;
	properties: ElementProperty[];
	setDefaults?: boolean;
}

export interface ElementContext {
	patternLibrary: PatternLibrary;
	project: Project;
}

/**
 * A page element provides the properties data of a pattern.
 * It represents the pattern component instance from a designer's point-of-view.
 * Page elements are nested within a page.
 */
export class Element {
	private container?: ElementContent;

	@Mobx.observable private contents: ElementContent[] = [];

	@Mobx.observable private editedName: string;

	@Mobx.observable private id: string;

	@Mobx.observable private name: string;

	@Mobx.observable private nameEditable: boolean = false;

	private page?: Page;

	private parent: Element;

	private pattern: Pattern;

	private patternLibrary: PatternLibrary;

	private project: Project;

	private properties: ElementProperty[];

	public constructor(init: ElementInit, context: ElementContext) {
		this.id = init.id ? init.id : Uuid.v4();
		this.pattern = init.pattern;
		this.container = init.container;

		this.patternLibrary = context.patternLibrary;
		this.project = context.project;

		this.pattern.getSlots().forEach(slot => {
			const hydratedSlot = init.contents.find(content => content.getSlotId() === slot.getId());

			this.contents.push(
				new ElementContent({
					elementId: this.id,
					id: Uuid.v4(),
					name: slot.getName(),
					elements: hydratedSlot ? hydratedSlot.getElements() : [],
					slotId: slot.getId(),
					slotType: slot.getType()
				})
			);
		});

		if (typeof init.name !== 'undefined') {
			this.name = init.name;
		}

		if (this.name === undefined && this.pattern) {
			this.name = this.pattern.getName();
		}

		this.properties = this.pattern.getProperties().map(patternProperty => {
			const hydratedProperty = init.properties.find(elementProperty =>
				elementProperty.hasPatternProperty(patternProperty)
			);

			if (hydratedProperty) {
				return hydratedProperty;
			}

			return new ElementProperty(
				{
					id: Uuid.v4(),
					patternPropertyId: patternProperty.getId(),
					setDefault: Boolean(init.setDefaults),
					value: undefined
				},
				{
					patternLibrary: this.patternLibrary
				}
			);
		});
	}

	public static from(serialized: Types.SerializedElement, context: ElementContext): Element {
		return new Element(
			{
				id: serialized.id,
				name: serialized.name,
				pattern: context.patternLibrary.getPatternById(serialized.pattern) as Pattern,
				contents: serialized.contents.map(content =>
					ElementContent.from(content, {
						elementId: serialized.id,
						patternLibrary: context.patternLibrary,
						project: context.project
					})
				),
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
		const payload = this.toJSON();
		delete payload.id;

		const clone = new Element(
			{
				container: undefined,
				contents: this.contents.map(content => content.clone()),
				name: this.name,
				pattern: this.pattern,
				properties: this.properties.map(propertyValue => propertyValue.clone())
			},
			{
				patternLibrary: this.patternLibrary,
				project: this.project
			}
		);

		return clone;
	}

	public getContainer(): ElementContent | undefined {
		return this.container;
	}

	public getContainerType(): undefined | Types.SlotType {
		if (!this.container) {
			return;
		}
		return this.container.getSlotType();
	}

	public getContentById(contentId: string): ElementContent | undefined {
		let result;

		for (const content of this.contents) {
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

	public getContentBySlot(slot: PatternSlot): ElementContent | undefined {
		return this.getContentBySlotId(slot.getId());
	}

	public getContentBySlotId(slotId: string): ElementContent | undefined {
		return this.contents.find(content => content.getSlotId() === slotId);
	}

	public getContentBySlotType(slotType: Types.SlotType): ElementContent | undefined {
		return this.contents.find(content => content.getSlotType() === slotType);
	}

	public getElementById(id: string): Element | undefined {
		let result;

		if (this.id === id) {
			return this;
		}

		for (const content of this.contents) {
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

		return container.getElementIndex(this);
	}

	public getName(opts?: { unedited: boolean }): string {
		if ((!opts || !opts.unedited) && this.nameEditable) {
			return this.editedName;
		}

		return this.name;
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
		if (!this.container) {
			return;
		}

		return this.project.getElementById(this.container.getElementId());
	}

	public getPattern(): Pattern | undefined {
		return this.pattern;
	}

	public getProperties(): ElementProperty[] {
		return this.properties;
	}

	public isAncestorOf(child: Element): boolean {
		if (child === this) {
			return true;
		}

		if (child.isRoot()) {
			return false;
		}

		return this.isAncestorOf(child.getParent() as Element);
	}

	public isDescendentOf(parent?: Element): boolean {
		return parent ? parent.isAncestorOf(this) : false;
	}

	public isNameEditable(): boolean {
		return this.nameEditable;
	}

	public isRoot(): boolean {
		return !Boolean(this.container);
	}

	public remove(): void {
		if (this.container) {
			this.container.remove({ element: this });
		}
	}

	public setContainer(container: ElementContent): void {
		this.container = container;
	}

	public setIndex(index: number): void {
		if (!this.container) {
			return;
		}

		this.setParent({
			parent: this.parent,
			slotId: this.container.getSlotId(),
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

	public setPage(page: Page): void {
		this.page = page;
	}

	public setParent(init: { index: number; parent: Element; slotId: string }): void {
		if (this.container) {
			this.container.remove({ element: this });
		}

		const container = init.parent.getContentBySlotId(init.slotId);

		if (container) {
			container.insert({ element: this, at: init.index });
		}

		this.container = container;
	}

	public toJSON(): Types.SerializedElement {
		return {
			contents: this.contents.map(content => content.toJSON()),
			id: this.id,
			name: this.name,
			pattern: this.pattern.getId(),
			properties: this.properties.map(elementProperty => elementProperty.toJSON())
		};
	}
}
