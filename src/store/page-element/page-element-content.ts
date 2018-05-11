import * as MobX from 'mobx';
import { PageElement } from './page-element';
import { Styleguide } from '../styleguide';
import * as Types from '../types';

export interface PageElementContentContext {
	elementId: string;
	styleguide: Styleguide;
}

export interface PageElementContentInit {
	elementId: string;
	elements: PageElement[];
	id: string;
	name: string;
	slotId: string;
	slotType: Types.SlotType;
}

export class PageElementContent {
	@MobX.observable private elementId: string;
	@MobX.observable private elements: PageElement[] = [];
	@MobX.observable private id: string;
	@MobX.observable private name: string;
	@MobX.observable private slotId: string;
	@MobX.observable private slotType: Types.SlotType;

	public constructor(init: PageElementContentInit) {
		this.id = init.id;
		this.elementId = init.elementId;
		this.name = init.name;
		this.elements = init.elements;
		this.elements.forEach((element, index) => this.insert({ element, at: index }));
		this.slotId = init.slotId;
		this.slotType = init.slotType;
	}

	public static from(
		serialized: Types.SerializedPageElementContent,
		context: PageElementContentContext
	): PageElementContent {
		return new PageElementContent({
			elementId: context.elementId,
			id: serialized.id,
			name: serialized.name,
			elements: serialized.elements.map(element =>
				PageElement.from(element, { styleguide: context.styleguide })
			),
			slotId: serialized.slotId,
			slotType: toSlotType(serialized.slotType)
		});
	}

	public clone(): PageElementContent {
		const clone = new PageElementContent({
			elementId: this.elementId,
			elements: this.elements.map(element => element.clone()),
			id: this.id,
			name: this.name,
			slotId: this.slotId,
			slotType: this.slotType
		});

		clone.getElements().forEach(element => element.setContainer(clone));

		return clone;
	}

	public getElementId(): string {
		return this.elementId;
	}

	public getElementIndex(element: PageElement): number {
		return this.elements.indexOf(element);
	}

	public getElements(): PageElement[] {
		return this.elements;
	}

	public getSlotId(): string {
		return this.slotId;
	}

	public getSlotType(): Types.SlotType {
		return this.slotType;
	}

	@MobX.action
	public insert(options: { at: number; element: PageElement }): void {
		const id = options.element.getId();

		options.element.setContainer(this);

		if (this.elements.find(e => e.getId() === id)) {
			return;
		}

		this.elements.splice(options.at, 0, options.element);
	}

	@MobX.action
	public remove(options: { element: PageElement }): void {
		const index = this.elements.indexOf(options.element);

		if (index === -1) {
			return;
		}

		this.elements.splice(index, 1);
	}

	public toJSON(): Types.SerializedPageElementContent {
		return {
			id: this.id,
			name: this.name,
			elements: this.elements.map(element => element.toJSON()),
			slotId: this.slotId,
			slotType: this.slotType
		};
	}
}

function toSlotType(type: string): Types.SlotType {
	switch (type) {
		case 'property':
			return Types.SlotType.Property;
		case 'children':
		default:
			return Types.SlotType.Children;
	}
}
