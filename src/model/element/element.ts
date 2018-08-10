import { computeDifference } from '../../alva-util';
import { ElementContent } from './element-content';
import { ElementProperty } from './element-property';
import * as _ from 'lodash';
import * as Mobx from 'mobx';
import { Page } from '../page';
import { Pattern } from '../pattern';
import { AnyPatternProperty } from '../pattern-property';
import { Project } from '../project';
import * as Types from '../../types';
import * as uuid from 'uuid';

export interface ElementInit {
	containerId?: string;
	contentIds: string[];
	dragged: boolean;
	focused: boolean;
	forcedOpen: boolean;
	highlighted: boolean;
	id?: string;
	name?: string;
	open: boolean;
	patternId: string;
	placeholderHighlighted: boolean;
	properties: ElementProperty[];
	role?: Types.ElementRole;
	selected: boolean;
	setDefaults?: boolean;
}

export interface ElementContext {
	project: Project;
}

export class Element {
	public readonly model = Types.ModelName.Element;

	@Mobx.observable private containerId?: string;

	@Mobx.observable private readonly contentIds: string[] = [];

	@Mobx.observable private dragged: boolean;

	@Mobx.observable private editedName: string;

	@Mobx.observable private shouldFocus: boolean;

	@Mobx.observable private forcedOpen: boolean;

	@Mobx.observable private shouldHighlight: boolean;

	@Mobx.observable private id: string;

	@Mobx.observable private name: string;

	@Mobx.observable private nameEditable: boolean = false;

	@Mobx.observable private open: boolean;

	@Mobx.observable private parent: Element;

	@Mobx.observable private patternId: string;

	@Mobx.observable private shouldPlaceholderHighlight: boolean;

	private project: Project;

	@Mobx.observable private properties: Map<string, ElementProperty> = new Map();

	@Mobx.observable private role: Types.ElementRole;

	@Mobx.observable private selected: boolean;

	@Mobx.computed
	private get mayHighiglight(): boolean {
		if (!this.page || !this.page.getActive()) {
			return false;
		}

		return true;
	}

	@Mobx.computed
	private get highlighted(): boolean {
		if (!this.shouldHighlight) {
			return false;
		}

		return this.mayHighiglight;
	}

	@Mobx.computed
	private get placeholderHighlighted(): boolean {
		if (!this.shouldPlaceholderHighlight) {
			return false;
		}

		return this.mayHighiglight;
	}

	@Mobx.computed
	private get focused(): boolean {
		if (!this.shouldFocus) {
			return false;
		}

		return this.mayHighiglight;
	}

	@Mobx.computed
	private get page(): Page | undefined {
		return this.project.getPages().find(page => page.hasElement(this));
	}

	@Mobx.computed
	private get pattern(): Pattern | undefined {
		return this.project.getPatternById(this.patternId);
	}

	@Mobx.computed
	private get propertyByPatternProperty(): Map<string, ElementProperty> {
		const map = new Map();

		this.properties.forEach(property => {
			map.set(property.getPatternPropertyId(), property);
		});

		return map;
	}

	@Mobx.computed
	private get patternProperties(): AnyPatternProperty[] {
		if (!this.pattern) {
			return [];
		}

		return this.pattern.getProperties();
	}

	@Mobx.computed
	private get computedProperties(): ElementProperty[] {
		return this.patternProperties.map(patternProperty => {
			const elementProperty = this.propertyByPatternProperty.get(patternProperty.getId());

			if (elementProperty) {
				return elementProperty;
			}

			const newElementProperty = ElementProperty.fromPatternProperty(patternProperty, {
				project: this.project
			});

			this.addProperty(newElementProperty);
			return newElementProperty;
		});
	}

	public constructor(init: ElementInit, context: ElementContext) {
		this.dragged = init.dragged;
		this.shouldFocus = init.focused;
		this.shouldHighlight = init.highlighted;
		this.shouldPlaceholderHighlight = init.placeholderHighlighted;
		this.id = init.id ? init.id : uuid.v4();
		this.patternId = init.patternId;
		this.containerId = init.containerId;
		this.open = init.open;
		this.forcedOpen = init.forcedOpen;
		this.project = context.project;
		this.role = init.role || Types.ElementRole.Node;
		this.selected = init.selected;

		const pattern = this.project.getPatternById(this.patternId);

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
						project: this.project
					}
				);
			});
		};

		getProperties().forEach(prop => this.properties.set(prop.getId(), prop));
	}

	public static from(serialized: Types.SerializedElement, context: ElementContext): Element {
		return new Element(
			{
				dragged: serialized.dragged,
				focused: serialized.focused,
				highlighted: serialized.highlighted,
				id: serialized.id,
				name: serialized.name,
				patternId: serialized.patternId,
				placeholderHighlighted: serialized.placeholderHighlighted,
				containerId: serialized.containerId,
				contentIds: serialized.contentIds,
				open: serialized.open,
				forcedOpen: serialized.forcedOpen,
				properties: Array.from(serialized.properties || []).map(p =>
					ElementProperty.from(p, context)
				),
				role: deserializeRole(serialized.role),
				selected: serialized.selected
			},
			context
		);
	}

	public accepts(child: Element): boolean {
		const childrenContent = this.getContentBySlotType(Types.SlotType.Children);

		if (!childrenContent) {
			return false;
		}

		return childrenContent.accepts(child);
	}

	public acceptsChildren(): boolean {
		return typeof this.getContentBySlotType(Types.SlotType.Children) !== 'undefined';
	}

	@Mobx.action
	public addChild(child: Element, slotId: string, index: number): void {
		child.setParent({
			parent: this,
			slotId,
			index
		});
	}

	@Mobx.action
	public addProperty(property: ElementProperty): void {
		this.properties.set(property.getId(), property);
	}

	@Mobx.action
	public clone(opts?: { withState: boolean }): Element {
		const withState = Boolean(opts && opts.withState);

		const clonedContents = this.contentIds
			.map(contentId => this.project.getElementContentById(contentId))
			.filter((content): content is ElementContent => typeof content !== 'undefined')
			.map(content => content.clone({ withState }));

		const clone = new Element(
			{
				dragged: false,
				focused: withState ? this.focused : false,
				highlighted: withState ? this.shouldHighlight : false,
				id: uuid.v4(),
				containerId: withState ? this.containerId : undefined,
				contentIds: clonedContents.map(content => content.getId()),
				name: this.name,
				open: withState ? this.open : false,
				forcedOpen: withState ? this.forcedOpen : false,
				patternId: this.patternId,
				placeholderHighlighted: withState ? this.placeholderHighlighted : false,
				properties: this.getProperties().map(propertyValue => propertyValue.clone()),
				role: this.role,
				selected: withState ? this.selected : false
			},
			{
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

	public equals(b: Element): boolean {
		return _.isEqual(this.toJSON(), b.toJSON());
	}

	public getAncestors(init: (Element | ElementContent)[] = []): (Element | ElementContent)[] {
		const parent = this.getParent();
		const container = this.getContainer();

		if (!parent || !container) {
			return init;
		}

		init.push(parent);
		init.push(container);
		parent.getAncestors(init);

		return init;
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

	public getDragged(): boolean {
		return this.dragged;
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

	public getForcedOpen(): boolean {
		return this.forcedOpen;
	}

	public getHighlighted(): boolean {
		return this.highlighted;
	}

	public getFocused(): boolean {
		return this.focused;
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

	public getNameEditable(): boolean {
		return this.nameEditable;
	}

	public getOpen(): boolean {
		return this.open;
	}

	public getParent(): Element | undefined {
		const container = this.getContainer();

		if (!container || this.role === Types.ElementRole.Root) {
			return;
		}

		const containerParentId = container.getParentElementId();

		if (!containerParentId) {
			return;
		}

		return this.project.getElementById(containerParentId);
	}

	public hasPattern(pattern: Pattern): boolean {
		return this.patternId === pattern.getId();
	}

	public getPattern(): Pattern | undefined {
		return this.project.getPatternById(this.patternId);
	}

	public getPlaceholderHighlighted(): boolean {
		return this.placeholderHighlighted;
	}

	@Mobx.action
	public getProperties(): ElementProperty[] {
		return this.computedProperties;
	}

	public getRole(): Types.ElementRole {
		return this.role;
	}

	public getSelected(): boolean {
		if (!this.page || !this.page.getActive()) {
			return false;
		}

		return this.selected;
	}

	public isAncestorOfById(id: string): boolean {
		const match = this.getElementById(id);
		return Boolean(match);
	}

	@Mobx.action
	public remove(): void {
		const container = this.getContainer();

		if (container) {
			container.remove({ element: this });
		}
	}

	@Mobx.action
	public removeProperty(property: ElementProperty): void {
		this.properties.delete(property.getId());
	}

	@Mobx.action
	public setContainer(container: ElementContent): void {
		this.containerId = container.getId();
	}

	@Mobx.action
	public setDragged(dragged: boolean): void {
		this.dragged = dragged;
	}

	@Mobx.action
	public setForcedOpen(forcedOpen: boolean): void {
		this.forcedOpen = forcedOpen;
	}

	@Mobx.action
	public setHighlighted(highlighted: boolean): void {
		this.shouldHighlight = highlighted;
	}

	@Mobx.action
	public setFocused(focused: boolean): void {
		this.shouldFocus = focused;
	}

	@Mobx.action
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

	@Mobx.action
	public setName(name: string): void {
		if (this.nameEditable) {
			this.editedName = name;
		} else {
			this.name = name;
		}
	}

	@Mobx.action
	public setNameEditable(nameEditable: boolean): void {
		if (nameEditable) {
			this.editedName = this.name;
		} else {
			this.name = this.editedName || this.name;
		}

		this.nameEditable = nameEditable;
	}

	@Mobx.action
	public setOpen(open: boolean): void {
		this.open = open;
	}

	@Mobx.action
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

	@Mobx.action
	public setPlaceholderHighlighted(placeholderHighlighted: boolean): void {
		this.shouldPlaceholderHighlight = placeholderHighlighted;
	}

	public setProject(project: Project): void {
		this.project = project;
	}

	@Mobx.action
	public setSelected(selected: boolean): void {
		this.selected = selected;
	}

	public toDisk(): Types.SerializedElement {
		const serialized = this.toJSON();
		serialized.dragged = false;
		serialized.highlighted = false;
		serialized.placeholderHighlighted = false;
		serialized.selected = false;
		return serialized;
	}

	@Mobx.action
	public toggleHighlighted(): void {
		this.setHighlighted(!this.getHighlighted());
	}

	@Mobx.action
	public toggleOpen(): void {
		this.setOpen(!this.getOpen() && !this.getForcedOpen());
		this.setForcedOpen(false);
	}

	@Mobx.action
	public toggleSelected(): void {
		this.setSelected(!this.getSelected());
	}

	public toJSON(): Types.SerializedElement {
		return {
			model: this.model,
			containerId: this.containerId,
			contentIds: Array.from(this.contentIds),
			dragged: this.dragged,
			focused: this.focused,
			highlighted: this.shouldHighlight,
			id: this.id,
			name: this.name,
			open: this.open,
			forcedOpen: this.forcedOpen,
			patternId: this.patternId,
			placeholderHighlighted: this.placeholderHighlighted,
			properties: this.getProperties().map(elementProperty => elementProperty.toJSON()),
			role: serializeRole(this.role),
			selected: this.selected
		};
	}

	@Mobx.action
	public unsetContainer(): void {
		this.containerId = undefined;
	}

	@Mobx.action
	public update(b: Element): void {
		if (this.selected) {
			this.project.unsetSelectedElement();
		}

		if (this.shouldHighlight) {
			this.project.unsetHighlightedElement();
		}

		const propsChanges = computeDifference({
			before: this.getProperties(),
			after: b.getProperties()
		});

		propsChanges.removed.forEach(change => this.removeProperty(change.before));
		propsChanges.added.forEach(change => this.addProperty(change.after));
		propsChanges.changed.forEach(change => change.before.update(change.after));

		this.shouldHighlight = b.shouldHighlight;
		this.dragged = b.dragged;
		this.shouldFocus = b.focused;
		this.containerId = b.containerId;
		this.name = b.name;
		this.open = b.open;
		this.forcedOpen = b.forcedOpen;
		this.shouldPlaceholderHighlight = b.placeholderHighlighted;
		this.selected = b.selected;
	}
}

function deserializeRole(input: Types.SerializedElementRole): Types.ElementRole {
	switch (input) {
		case 'root':
			return Types.ElementRole.Root;
		case 'node':
			return Types.ElementRole.Node;
	}
	throw new Error(`Unknown element role: ${input}`);
}

function serializeRole(input: Types.ElementRole): Types.SerializedElementRole {
	switch (input) {
		case Types.ElementRole.Root:
			return 'root';
		case Types.ElementRole.Node:
			return 'node';
	}
	throw new Error(`Unknown element role: ${input}`);
}
