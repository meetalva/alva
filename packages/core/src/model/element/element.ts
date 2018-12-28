import { ElementAction } from '../element-action';
import { ElementContent } from './element-content';
import { ElementProperty } from './element-property';
import * as _ from 'lodash';
import * as Mobx from 'mobx';
import { Page } from '../page';
import { Pattern } from '../pattern';
import { AnyPatternProperty } from '../pattern-property';
import { Project } from '../project';
import * as Types from '../../types';
import { UserStoreReference } from '../user-store-reference';
import * as uuid from 'uuid';
import { PatternLibrary } from '../pattern-library';
import { PlaceholderPosition } from '../../components';

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
	placeholderHighlighted: PlaceholderPosition;
	propertyValues: [string, Types.ElementPropertyValue][];
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

	@Mobx.observable private editedName?: string;

	@Mobx.observable private shouldFocus: boolean;

	@Mobx.observable private forcedOpen: boolean;

	@Mobx.observable private shouldHighlight: boolean;

	@Mobx.observable private id: string;

	@Mobx.observable private name: string;

	@Mobx.observable private nameEditable: boolean = false;

	@Mobx.observable private open: boolean;

	@Mobx.observable private parent?: Element;

	@Mobx.observable private patternId: string;

	@Mobx.observable private shouldPlaceholderHighlight: PlaceholderPosition;

	private project: Project;

	@Mobx.observable private propertyValues: Map<string, Types.ElementPropertyValue> = new Map();

	@Mobx.observable private role: Types.ElementRole;

	@Mobx.observable private selected: boolean;

	/**
	/* TODO: Remove before beta
	/* Keep backward compat
	/*/
	private readonly LEGACY_elementPropertyIds: Map<string, string> = new Map();

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
	private get placeholderHighlighted(): PlaceholderPosition {
		if (!this.shouldPlaceholderHighlight) {
			return PlaceholderPosition.None;
		}

		return this.mayHighiglight ? this.shouldPlaceholderHighlight : PlaceholderPosition.None;
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
	private get patternProperties(): AnyPatternProperty[] {
		if (!this.pattern) {
			return [];
		}
		return this.pattern.getProperties();
	}

	@Mobx.computed
	private get properties(): ElementProperty[] {
		return this.patternProperties.map(patternProperty =>
			ElementProperty.fromPatternProperty(patternProperty, {
				LEGACY_ID: this.LEGACY_elementPropertyIds.get(patternProperty.getId()),
				element: this,
				project: this.project
			})
		);
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

		this.name =
			typeof init.name !== 'undefined' ? init.name : pattern ? pattern.getName() : 'New Element';

		this.propertyValues = new Map(init.propertyValues);

		this.properties
			.filter(p => !this.propertyValues.has(p.getPatternPropertyId()))
			.forEach(p => this.propertyValues.set(p.getPatternPropertyId(), undefined));
	}

	public static from(serialized: Types.SerializedElement, context: ElementContext): Element {
		const element = new Element(
			{
				dragged: serialized.dragged,
				focused: serialized.focused,
				highlighted: serialized.highlighted,
				id: serialized.id,
				name: serialized.name,
				patternId: serialized.patternId,
				placeholderHighlighted: serialized.placeholderHighlighted as PlaceholderPosition,
				containerId: serialized.containerId,
				contentIds: serialized.contentIds,
				open: serialized.open,
				forcedOpen: serialized.forcedOpen,
				propertyValues: serialized.propertyValues,
				role: deserializeRole(serialized.role),
				selected: serialized.selected
			},
			context
		);

		/**
		 * TODO: Remove before beta
		 * Keep backward compat
		 */
		if (Array.isArray(serialized.properties)) {
			serialized.properties.forEach((property: Types.LegacySerializedElementProperty) => {
				element.setPropertyValue(property.patternPropertyId, property.value);
				element.LEGACY_elementPropertyIds.set(property.patternPropertyId, property.id);
			});
		}

		return element;
	}

	public static fromPattern(
		pattern: Pattern,
		init: { dragged: boolean; contents: ElementContent[]; project: Project }
	): Element {
		return new Element(
			{
				contentIds: init.contents.map(e => e.getId()),
				dragged: init.dragged || false,
				focused: false,
				highlighted: false,
				forcedOpen: false,
				open: false,
				patternId: pattern.getId(),
				placeholderHighlighted: PlaceholderPosition.None,
				propertyValues: [],
				setDefaults: true,
				selected: false
			},
			{
				project: init.project
			}
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
	public addContent(content: ElementContent): void {
		this.contentIds.push(content.getId());
	}

	@Mobx.action
	public clone(opts?: { withState: boolean; target?: Project }): Element {
		const target = opts && opts.target ? opts.target : this.project;
		const withState = Boolean(opts && opts.withState);
		const previousPattern = this.getPattern()!;
		const previousLibrary = previousPattern.getPatternLibrary();
		const nextLibrary = target.getPatternLibraryByContextId(previousLibrary.contextId)!;
		const nextPattern = nextLibrary.getPatternByContextId(previousPattern.getContextId());

		const clonedActions: Map<string, ElementAction> = this.properties
			.filter(prop => {
				const patternProperty = prop.getPatternProperty();
				return (
					patternProperty &&
					patternProperty.getType() === Types.PatternPropertyType.EventHandler
				);
			})
			.reduce((clones, prop) => {
				const id = prop.getValue() as string;

				if (!id) {
					return clones;
				}

				const elementAction = this.project.getElementActionById(id);

				if (!elementAction) {
					return clones;
				}

				clones.set(prop.getPatternPropertyId(), elementAction.clone());
				return clones;
			}, new Map());

		const clonedContents = [...this.contentIds]
			.map(contentId => this.project.getElementContentById(contentId))
			.filter((content): content is ElementContent => typeof content !== 'undefined')
			.map(content => content.clone({ withState, target }));

		const propertyValues: [string, Types.ElementPropertyValue][] = [
			...this.propertyValues.entries()
		].map(([id, value]) => {
			const clonedAction = clonedActions.get(id);
			const previousProperty = previousPattern.getPropertyById(id);
			const nextProperty = nextPattern!.getPropertyByContextId(previousProperty!.getContextId());
			const nextId = nextProperty!.getId();

			if (clonedAction) {
				return [nextId, clonedAction.getId()] as [string, string];
			}

			return [nextId, value] as [string, Types.ElementPropertyValue];
		});

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
				patternId: nextPattern!.getId(),
				placeholderHighlighted: withState
					? this.placeholderHighlighted
					: PlaceholderPosition.None,
				propertyValues,
				role: this.role,
				selected: withState ? this.selected : false
			},
			{
				project: target
			}
		);

		const clonedReferences = this.properties
			.map(prop => prop.getUserStoreReference())
			.filter((prop): prop is UserStoreReference => typeof prop !== 'undefined')
			.map(ref => {
				const sourceElementProperty = this.project.getElementPropertyById(
					ref.getElementPropertyId()
				);

				if (!sourceElementProperty) {
					return;
				}

				const sourcePatternProperty = sourceElementProperty.getPatternProperty();

				if (!sourcePatternProperty) {
					return;
				}

				const clonedProperty = clone.properties.find(
					prop => prop.getPatternProperty() === sourcePatternProperty
				);

				if (!clonedProperty) {
					return;
				}

				return ref.clone({ elementPropertyId: clonedProperty.getId(), open: false });
			})
			.filter((ref): ref is UserStoreReference => typeof ref !== 'undefined');

		clonedReferences.forEach(clonedReference => {
			target.getUserStore().addReference(clonedReference);
		});

		clonedContents.forEach(clonedContent => {
			clonedContent.setParentElement(clone);
			target.addElementContent(clonedContent);
		});

		[...clonedActions.values()].forEach(clonedAction => {
			target.addElementAction(clonedAction);
		});

		target.addElement(clone);
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
		return [...this.contentIds]
			.map(contentId => this.project.getElementContentById(contentId))
			.filter(
				(elementContent): elementContent is ElementContent =>
					typeof elementContent !== 'undefined'
			);
	}

	public getDescendants(): Element[] {
		return this.getContents().reduce<Element[]>(
			(acc, content) => [...acc, ...content.getDescendants()],
			[]
		);
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
		if ((!opts || !opts.unedited) && this.nameEditable && this.editedName) {
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

	public getPage(): Page | undefined {
		return this.page;
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

	@Mobx.action
	public setPattern(pattern: Pattern): void {
		const previousPattern = this.getPattern();
		this.patternId = pattern.getId();

		if (previousPattern) {
			pattern.getProperties().forEach(prop => {
				const previousProp =
					pattern.getOrigin() === Types.PatternOrigin.BuiltIn
						? previousPattern.getPropertyByContextId(prop.getContextId())
						: previousPattern.getPropertyById(prop.getId());

				if (!previousProp) {
					return;
				}

				const previousValue = this.getPropertyValue(previousProp.getId());
				this.propertyValues.delete(previousProp.getId());
				this.propertyValues.set(prop.getId(), previousValue);
			});
		}
	}

	public getPlaceholderHighlighted(): boolean | PlaceholderPosition {
		return this.placeholderHighlighted;
	}

	public getProperties(): ElementProperty[] {
		return this.properties;
	}

	public getPropertyValue(id: string): Types.ElementPropertyValue {
		return this.propertyValues.get(id);
	}

	@Mobx.action
	public setPropertyValue(id: string, value: Types.ElementPropertyValue): void {
		this.propertyValues.set(id, value);
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

		if (!this.parent) {
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
	public setPlaceholderHighlighted(placeholderHighlighted: PlaceholderPosition): void {
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
		serialized.placeholderHighlighted = PlaceholderPosition.None;
		serialized.selected = false;
		serialized.forcedOpen = false;
		serialized.focused = false;
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
			propertyValues: Array.from(this.propertyValues.entries()),
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
		this.containerId = b.containerId;
		this.name = b.name;

		Array.from(b.propertyValues.entries()).forEach(([key, value]) => {
			this.propertyValues.set(key, value);
		});
	}

	public getLibraryDependencies(): PatternLibrary[] {
		const patterns = [this.getPattern(), ...this.getDescendants().map(d => d.getPattern())]
			.filter((p): p is Pattern => typeof p !== 'undefined')
			.map(p => ({
				id: p.getId(),
				contextId: p.getContextId(),
				libraryId: p.getPatternLibrary().getId(),
				origin: p.getOrigin(),
				type: p.getType()
			}));

		return _.uniqBy(
			patterns
				.map(p => this.project.getPatternLibraryById(p.libraryId))
				.filter((p): p is PatternLibrary => typeof p !== 'undefined'),
			'id'
		);
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
