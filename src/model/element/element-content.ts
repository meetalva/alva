import { Element } from './element';
import * as Mobx from 'mobx';
import { PatternSlot } from '../pattern';
import { PatternLibrary } from '../pattern-library';
import { Project } from '../project';
import * as Types from '../../types';
import * as uuid from 'uuid';

export interface ElementContentContext {
	patternLibrary: PatternLibrary;
	project: Project;
}

export interface ElementContentInit {
	elementIds: string[];
	forcedOpen: boolean;
	id: string;
	open: boolean;
	parentElementId?: string;
	slotId: string;
}

export class ElementContent {
	@Mobx.observable private elementIds: string[] = [];
	@Mobx.observable private forcedOpen: boolean;
	@Mobx.observable private highlighted: boolean;
	@Mobx.observable private id: string;
	@Mobx.observable private open: boolean;
	@Mobx.observable private parentElementId?: string;
	@Mobx.observable private patternLibrary: PatternLibrary;
	private project: Project;

	@Mobx.observable private slotId: string;

	public constructor(init: ElementContentInit, context: ElementContentContext) {
		this.forcedOpen = init.forcedOpen;
		this.id = init.id;
		this.open = init.open;
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
				forcedOpen: serialized.forcedOpen,
				id: serialized.id,
				open: serialized.open,
				parentElementId: serialized.parentElementId,
				slotId: serialized.slotId
			},
			context
		);
	}

	public accepts(child: Element): boolean {
		const parentElementId = this.getParentElementId();

		if (!parentElementId) {
			return false;
		}

		return !child.isAncestorOfById(parentElementId) && this.acceptsChildren();
	}

	public acceptsChildren(): boolean {
		return true;
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
				forcedOpen: false,
				id: uuid.v4(),
				open: false,
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

	public getForcedOpen(): boolean {
		return this.forcedOpen;
	}

	public getHighlighted(): boolean {
		return this.highlighted;
	}

	public getId(): string {
		return this.id;
	}

	public getOpen(): boolean {
		return this.open;
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
	public setForcedOpen(forcedOpen: boolean): void {
		this.forcedOpen = forcedOpen;
	}

	@Mobx.action
	public setHighlighted(highlighted: boolean): void {
		this.highlighted = highlighted;
	}

	@Mobx.action
	public setOpen(open: boolean): void {
		this.open = open;
	}

	@Mobx.action
	public setParentElement(element: Element): void {
		this.parentElementId = element.getId();
	}

	@Mobx.action
	public setPatternLibrary(patternLibrary: PatternLibrary): void {
		this.patternLibrary = patternLibrary;
	}

	@Mobx.action
	public toggleOpen(): void {
		this.setOpen(!this.getOpen() && !this.getForcedOpen());
		this.setForcedOpen(false);
	}

	public toJSON(): Types.SerializedElementContent {
		return {
			elementIds: Array.from(this.elementIds),
			forcedOpen: this.forcedOpen,
			id: this.id,
			open: this.open,
			parentElementId: this.parentElementId,
			slotId: this.slotId
		};
	}
}
