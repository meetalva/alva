import { Element } from './element';
import * as Mobx from 'mobx';
import { PatternSlot } from '../pattern';
import { PatternLibrary } from '../pattern-library';
import { Project } from '../project';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface ElementContentContext {
	patternLibrary: PatternLibrary;
	project: Project;
}

export interface ElementContentInit {
	elementIds: string[];
	id: string;
	name: string;
	parentElementId?: string;
	slotId: string;
}

export class ElementContent {
	@Mobx.observable private elementIds: string[] = [];
	@Mobx.observable private id: string;
	@Mobx.observable private name: string;
	@Mobx.observable private parentElementId?: string;
	@Mobx.observable private patternLibrary: PatternLibrary;
	private project: Project;

	@Mobx.observable private slotId: string;

	public constructor(init: ElementContentInit, context: ElementContentContext) {
		this.id = init.id;
		this.name = init.name;
		this.elementIds = init.elementIds;
		this.slotId = init.slotId;

		this.patternLibrary = context.patternLibrary;
		this.project = context.project;

		if (init.parentElementId) {
			this.parentElementId = init.parentElementId;
		}
	}

	public static from(
		serialized: Types.SerializedElementContent,
		context: ElementContentContext
	): ElementContent {
		return new ElementContent(
			{
				elementIds: serialized.elementIds,
				id: serialized.id,
				name: serialized.name,
				parentElementId: serialized.parentElementId,
				slotId: serialized.slotId
			},
			context
		);
	}

	@Mobx.action
	public clone(): ElementContent {
		const clonedElements = this.elementIds
			.map(elementId => this.project.getElementById(elementId))
			.filter((e): e is Element => typeof e !== 'undefined')
			.map(e => e.clone());

		const clone = new ElementContent(
			{
				elementIds: clonedElements.map(e => e.getId()),
				id: uuid.v4(),
				name: this.name,
				slotId: this.slotId
			},
			{
				patternLibrary: this.patternLibrary,
				project: this.project
			}
		);

		clonedElements.forEach(clonedElement => {
			this.project.addElement(clonedElement);
			clonedElement.setContainer(clone);
		});

		return clone;
	}

	public getDescendants(): Element[] {
		return this.getElements().reduce(
			(acc, element) => [...acc, element, ...element.getDescendants()],
			[]
		);
	}

	public getElementIndexById(id: string): number {
		return this.elementIds.indexOf(id);
	}

	public getElements(): Element[] {
		return this.elementIds
			.map(id => this.project.getElementById(id))
			.filter((element): element is Element => typeof element !== 'undefined');
	}

	public getId(): string {
		return this.id;
	}

	public getParentElement(): Element | undefined {
		if (!this.parentElementId) {
			return;
		}

		return this.project.getElementById(this.parentElementId);
	}

	public getParentElementId(): string | undefined {
		return this.parentElementId;
	}

	public getSlot(): PatternSlot {
		return this.patternLibrary
			.getSlots()
			.find(slot => slot.getId() === this.slotId) as PatternSlot;
	}

	public getSlotId(): string {
		return this.slotId;
	}

	public getSlotType(): Types.SlotType {
		return this.getSlot().getType();
	}

	@Mobx.action
	public insert(options: { at: number; element: Element }): void {
		options.element.setContainer(this);

		const id = options.element.getId();

		if (this.elementIds.find(eid => eid === id)) {
			return;
		}

		this.elementIds.splice(options.at, 0, id);
	}

	@Mobx.action
	public remove(options: { element: Element }): void {
		const index = this.elementIds.indexOf(options.element.getId());

		if (index === -1) {
			return;
		}

		options.element.unsetContainer();
		this.elementIds.splice(index, 1);
	}

	@Mobx.action
	public setParentElement(element: Element): void {
		this.parentElementId = element.getId();
	}

	@Mobx.action
	public setPatternLibrary(patternLibrary: PatternLibrary): void {
		this.patternLibrary = patternLibrary;
	}

	public toJSON(): Types.SerializedElementContent {
		return {
			elementIds: Array.from(this.elementIds),
			id: this.id,
			name: this.name,
			parentElementId: this.parentElementId,
			slotId: this.slotId
		};
	}
}
