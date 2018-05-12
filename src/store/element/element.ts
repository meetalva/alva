import { ElementContent } from './element-content';
import { ElementProperty } from './element-property';
import * as Mobx from 'mobx';
import { Page } from '../page';
import { Pattern, PatternSlot } from '../pattern';
import { Styleguide } from '../styleguide';
import * as Types from '../types';
import * as Uuid from 'uuid';
import { ViewStore } from '../view-store';

export interface ElementInit {
	container?: ElementContent;
	contents: ElementContent[];
	id?: string;
	name?: string;
	pattern: Pattern;
	properties: ElementProperty[];
	setDefaults?: boolean;
}

export interface PageElementContext {
	styleguide: Styleguide;
}

/**
 * A page element provides the properties data of a pattern.
 * It represents the pattern component instance from a designer's point-of-view.
 * Page elements are nested within a page.
 */
export class Element {
	private container?: ElementContent;

	/**
	 * The content page elements of this element.
	 * Key = PatternSlot ID, Value = PatternSlot contents.
	 */
	@Mobx.observable private contents: ElementContent[] = [];

	/**
	 * The currently edited name of the page element, to be commited
	 */
	@Mobx.observable private editedName: string;

	/**
	 * The technical (internal) ID of the page element.
	 */
	@Mobx.observable private id: string;

	/**
	 * The assigned name of the page element, initially the pattern's human-friendly name.
	 */
	@Mobx.observable private name: string;

	/**
	 * Wether the element name is editable
	 */
	@Mobx.observable private nameEditable: boolean;

	/**
	 * The page this element belongs to.
	 */
	private page?: Page;

	/**
	 * The parent page element if this is not the root element.
	 */
	private parent: Element;

	/**
	 * The pattern this page element reflects. Usually set, may only the undefined if the pattern
	 * has disappeared or got invalid in the mean-time.
	 */
	private pattern: Pattern;

	/**
	 * The pattern property values of this element's component instance.
	 * Each key represents the property ID of the pattern, while the value holds the content
	 * as provided by the designer.
	 */
	// @MobX.observable private properties: Map<string, Types.PropertyValue> = new Map();

	private properties: ElementProperty[];

	/**
	 * Creates a new page element.
	 * @param pattern The pattern to create the element for.
	 * @param setDefaults Whether to initialize the property values with the defaults defined by
	 * the pattern implementation.
	 * @param parent The (optional) parent for this element. When set, the element is
	 * automatically added to this parent (and thus maybe to the entire page).
	 */
	public constructor(init: ElementInit) {
		this.id = init.id ? init.id : Uuid.v4();
		this.pattern = init.pattern;
		this.nameEditable = false;
		this.container = init.container;

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

			return new ElementProperty({
				id: Uuid.v4(),
				patternProperty,
				setDefault: Boolean(init.setDefaults),
				value: undefined
			});
		});
	}

	/**
	 * Loads and returns a page element from a given JSON object.
	 * @param jsonObject The JSON object to load from.
	 * @return A new page element object containing the loaded data.
	 */
	public static from(serialized: Types.SerializedElement, context: PageElementContext): Element {
		return new Element({
			id: serialized.id,
			name: serialized.name,
			pattern: context.styleguide.getPatternById(serialized.pattern) as Pattern,
			contents: serialized.contents.map(content =>
				ElementContent.from(content, {
					styleguide: context.styleguide,
					elementId: serialized.id
				})
			),
			properties: serialized.properties.map(p => ElementProperty.from(p))
		});
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

		const clone = new Element({
			container: undefined,
			contents: this.contents.map(content => content.clone()),
			name: this.name,
			pattern: this.pattern,
			properties: this.properties.map(propertyValue => propertyValue.clone())
		});

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

	/**
	 * Returns the technical (internal) ID of the page.
	 * @return The technical (internal) ID of the page.
	 */
	public getId(): string {
		return this.id;
	}

	/**
	 * Returns the 0-based position of this element within its parent slot.
	 * @return The 0-based position of this element.
	 */
	public getIndex(): number {
		const container = this.getContainer();

		if (!container) {
			return -1;
		}

		return container.getElementIndex(this);
	}

	/**x
	 * Returns the assigned name of the page element, initially the pattern's human-friendly name.
	 * @return The assigned name of the page element.
	 */
	public getName(opts?: { unedited: boolean }): string {
		if ((!opts || !opts.unedited) && this.nameEditable) {
			return this.editedName;
		}

		return this.name;
	}

	/**
	 * Returns the page this element belongs to.
	 * @return The page this element belongs to.
	 */
	public getPage(): Page | undefined {
		if (this.page) {
			return this.page;
		}

		if (this.parent) {
			return this.parent.getPage();
		}

		return;
	}

	/**
	 * Returns the parent page element if this is not the root element.
	 * @return The parent page element or undefined.
	 */
	public getParent(): Element | undefined {
		if (!this.container) {
			return;
		}

		const store = ViewStore.getInstance();
		return store.getElementById(this.container.getElementId());
	}

	/**
	 * Returns the pattern this page element reflects.
	 * Usually set, may only the undefined if the pattern has disappeared
	 * or got invalid in the mean-time.
	 * @return The pattern this page element reflects, or undefined.
	 */
	public getPattern(): Pattern | undefined {
		return this.pattern;
	}

	public getProperties(): ElementProperty[] {
		return this.properties;
	}

	/**
	 * Returns whether this element is an ancestor of a given child.
	 * Ancestors of a given element are the element itself,
	 * the parents of the element, and the parents of ancestors of the element.
	 * If the given child is empty, this method returns false.
	 * @param child The child to test.
	 * @return Whether this element is an ancestor of the given child.
	 */
	public isAncestorOf(child: Element): boolean {
		if (child === this) {
			return true;
		}

		if (child.isRoot()) {
			return false;
		}

		return this.isAncestorOf(child.getParent() as Element);
	}

	/**
	 * Returns whether this element is a descendent of a given parent.
	 * Descendents of a given parent are the element itself,
	 * the children of the element, and the children of descendants of the element.
	 * If the given parent is empty, this method returns false.
	 * @param parent The parent to test.
	 * @return Whether this element is a descendent of the given parent.
	 */
	public isDescendentOf(parent?: Element): boolean {
		return parent ? parent.isAncestorOf(this) : false;
	}

	/**
	 * Returns the editable state of the element's name
	 * @return The editable state
	 */
	public isNameEditable(): boolean {
		return this.nameEditable;
	}

	/**
	 * Returns whether this page element is the page's root element (i.e. it has no parent).
	 * @return Whether this page element is the root element.
	 */
	public isRoot(): boolean {
		return !Boolean(this.container);
	}

	/**
	 * Removes this page element from its parent. You may later re-add it using setParent().
	 * @see setParent()
	 */
	public remove(): void {
		if (this.container) {
			this.container.remove({ element: this });
		}
	}

	public setContainer(container: ElementContent): void {
		this.container = container;
	}

	/**
	 * Moves this page element to a new position within its parent
	 * @param index The new 0-based position within the parent's children.
	 */
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

	/**
	 * Sets the assigned name of the page element, initially the pattern's human-friendly name.
	 * @param name The assigned name of the page element.
	 */
	public setName(name: string): void {
		if (this.nameEditable) {
			this.editedName = name;
		} else {
			this.name = name;
		}
	}

	/**
	 * Sets the editable state of the element's name
	 * @param nameEditable Wether the name is editable
	 */
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

	/**
	 * Serializes the page element into a JSON object for persistence.
	 * @param forRendering Whether all property values should be converted using
	 * Property.convertToRender (for the preview app instead of file persistence).
	 * @return The JSON object to be persisted.
	 */
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
