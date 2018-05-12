import { Element } from './element';
import * as Mobx from 'mobx';
import { Styleguide } from '../styleguide';
import * as Types from '../types';

export interface ElementContentContext {
	elementId: string;
	styleguide: Styleguide;
}

export interface ElementContentInit {
	elementId: string;
	elements: Element[];
	id: string;
	name: string;
	slotId: string;
	slotType: Types.SlotType;
}

export class ElementContent {
	@Mobx.observable private elementId: string;
	@Mobx.observable private elements: Element[] = [];
	@Mobx.observable private id: string;
	@Mobx.observable private name: string;
	@Mobx.observable private slotId: string;
	@Mobx.observable private slotType: Types.SlotType;

	public constructor(init: ElementContentInit) {
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
		context: ElementContentContext
	): ElementContent {
		return new ElementContent({
			elementId: context.elementId,
			id: serialized.id,
			name: serialized.name,
			elements: serialized.elements.map(element =>
				Element.from(element, { styleguide: context.styleguide })
			),
			slotId: serialized.slotId,
			slotType: toSlotType(serialized.slotType)
		});
	}

	public clone(): ElementContent {
		const clone = new ElementContent({
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

	public getElementIndex(element: Element): number {
		return this.elements.indexOf(element);
	}

	public getElements(): Element[] {
		return this.elements;
	}

	public getId(): string {
		return this.id;
	}

	public getSlotId(): string {
		return this.slotId;
	}

	public getSlotType(): Types.SlotType {
		return this.slotType;
	}

	@Mobx.action
	public insert(options: { at: number; element: Element }): void {
		const id = options.element.getId();

		options.element.setContainer(this);

		if (this.elements.find(e => e.getId() === id)) {
			return;
		}

		this.elements.splice(options.at, 0, options.element);
	}

	@Mobx.action
	public remove(options: { element: Element }): void {
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
