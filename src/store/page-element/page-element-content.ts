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
}

// TODO: Distinguish between content id and slot id
export class PageElementContent {
	@MobX.observable private elementId: string;
	@MobX.observable private elements: PageElement[] = [];
	@MobX.observable private id: string;
	@MobX.observable private name: string;

	public constructor(init: PageElementContentInit) {
		this.id = init.id;
		this.elementId = init.elementId;
		this.name = init.name;
		this.elements = init.elements;
		this.elements.forEach((element, index) => this.insert({ element, at: index }));
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
			)
		});
	}

	public getElementId(): string {
		return this.elementId;
	}

	public getElements(): PageElement[] {
		return this.elements;
	}

	public getId(): string {
		return this.id;
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
			elements: this.elements.map(element => element.toJSON())
		};
	}
}
