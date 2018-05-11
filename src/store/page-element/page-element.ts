import * as deepAssign from 'deep-assign';
import * as MobX from 'mobx';
import * as ObjectPath from 'object-path';
import { Page } from '../page';
import { PageElementContent } from './page-element-content';
import { Pattern, Property, Slot, Styleguide } from '../styleguide';
import * as Types from '../types';
import * as Uuid from 'uuid';
import { ViewStore } from '../view-store';

export interface PageElementProperties {
	container?: PageElementContent;
	contents: PageElementContent[];
	id?: string;
	name?: string;
	pattern: Pattern;
	properties?: Map<string, Types.PropertyValue>;
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
export class PageElement {
	private container?: PageElementContent;

	/**
	 * The content page elements of this element.
	 * Key = Slot ID, Value = Slot contents.
	 */
	@MobX.observable private contents: PageElementContent[] = [];

	/**
	 * The currently edited name of the page element, to be commited
	 */
	@MobX.observable private editedName: string;

	/**
	 * The technical (internal) ID of the page element.
	 */
	@MobX.observable private id: string;

	/**
	 * The assigned name of the page element, initially the pattern's human-friendly name.
	 */
	@MobX.observable private name: string;

	/**
	 * Wether the element name is editable
	 */
	@MobX.observable private nameEditable: boolean;

	/**
	 * The page this element belongs to.
	 */
	private page?: Page;

	/**
	 * The parent page element if this is not the root element.
	 */
	private parent: PageElement;

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
	@MobX.observable private properties: Map<string, Types.PropertyValue> = new Map();

	/**
	 * Creates a new page element.
	 * @param pattern The pattern to create the element for.
	 * @param setDefaults Whether to initialize the property values with the defaults defined by
	 * the pattern implementation.
	 * @param parent The (optional) parent for this element. When set, the element is
	 * automatically added to this parent (and thus maybe to the entire page).
	 */
	public constructor(properties: PageElementProperties) {
		this.id = properties.id ? properties.id : Uuid.v4();
		this.pattern = properties.pattern;
		this.nameEditable = false;
		this.container = properties.container;

		this.pattern.getSlots().forEach(slot => {
			const hydratedSlot = properties.contents.find(
				content => content.getSlotId() === slot.getId()
			);

			this.contents.push(
				new PageElementContent({
					elementId: this.id,
					id: Uuid.v4(),
					name: slot.getName(),
					elements: hydratedSlot ? hydratedSlot.getElements() : [],
					slotId: slot.getId(),
					slotType: slot.getType()
				})
			);
		});

		if (typeof properties.name !== 'undefined') {
			this.name = properties.name;
		}

		if (this.name === undefined && this.pattern) {
			this.name = this.pattern.getName();
		}

		if (properties.setDefaults && this.pattern) {
			this.pattern.getProperties().forEach(property => {
				this.setPropertyValue(property.getId(), property.getDefaultValue());
			});
		}

		if (properties.properties) {
			this.properties = properties.properties;
		}
	}

	/**
	 * Loads and returns a page element from a given JSON object.
	 * @param jsonObject The JSON object to load from.
	 * @return A new page element object containing the loaded data.
	 */
	public static from(
		serializedPageElement: Types.SerializedPageElement,
		context: PageElementContext
	): PageElement {
		return new PageElement({
			id: serializedPageElement.id,
			name: serializedPageElement.name,
			pattern: context.styleguide.getPatternById(serializedPageElement.pattern) as Pattern,
			contents: serializedPageElement.contents.map(content =>
				PageElementContent.from(content, {
					styleguide: context.styleguide,
					elementId: serializedPageElement.id
				})
			),
			properties: toMap(serializedPageElement.properties)
		});
	}

	public addChild(child: PageElement, slotId: string, index: number): void {
		child.setParent({
			parent: this,
			slotId,
			index
		});
	}

	public clone(): PageElement {
		const payload = this.toJSON();
		delete payload.id;

		const clone = new PageElement({
			container: undefined,
			contents: this.contents.map(content => content.clone()),
			name: this.name,
			pattern: this.pattern
		});

		this.properties.forEach((value: Types.PropertyValue, id: string) => {
			clone.setPropertyValue(id, value);
		});

		return clone;
	}

	public getContainer(): PageElementContent | undefined {
		return this.container;
	}

	public getContainerType(): undefined | Types.SlotType {
		if (!this.container) {
			return;
		}
		return this.container.getSlotType();
	}

	public getContentBySlot(slot: Slot): PageElementContent | undefined {
		return this.getContentBySlotId(slot.getId());
	}

	public getContentBySlotId(slotId: string): PageElementContent | undefined {
		return this.contents.find(content => content.getSlotId() === slotId);
	}

	public getContentBySlotType(slotType: Types.SlotType): PageElementContent | undefined {
		return this.contents.find(content => content.getSlotType() === slotType);
	}

	public getElementById(id: string): PageElement | undefined {
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
	public getParent(): PageElement | undefined {
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

	/**
	 * The content of a property of this page element.
	 * @param id The ID of the property to return the value of.
	 * @param path A dot ('.') separated optional path within an object property to point to a deep
	 * property. E.g., setting propertyId to 'image' and path to 'src.srcSet.xs',
	 * the operation edits 'image.src.srcSet.xs' on the element.
	 * @return The content value (as provided by the designer).
	 */
	public getPropertyValue(id: string, path?: string): Types.PropertyValue {
		const value: Types.PropertyValue = this.properties.get(id);

		if (!path) {
			return value;
		}

		return ObjectPath.get(value as {}, path);
	}

	/**
	 * Returns whether this element is an ancestor of a given child.
	 * Ancestors of a given element are the element itself,
	 * the parents of the element, and the parents of ancestors of the element.
	 * If the given child is empty, this method returns false.
	 * @param child The child to test.
	 * @return Whether this element is an ancestor of the given child.
	 */
	public isAncestorOf(child: PageElement): boolean {
		if (child === this) {
			return true;
		}

		if (child.isRoot()) {
			return false;
		}

		return this.isAncestorOf(child.getParent() as PageElement);
	}

	/**
	 * Returns whether this element is a descendent of a given parent.
	 * Descendents of a given parent are the element itself,
	 * the children of the element, and the children of descendants of the element.
	 * If the given parent is empty, this method returns false.
	 * @param parent The parent to test.
	 * @return Whether this element is a descendent of the given parent.
	 */
	public isDescendentOf(parent?: PageElement): boolean {
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

	public setContainer(container: PageElementContent): void {
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

	public setParent(init: { index: number; parent: PageElement; slotId: string }): void {
		if (this.container) {
			this.container.remove({ element: this });
		}

		const container = init.parent.getContentBySlotId(init.slotId);

		if (container) {
			container.insert({ element: this, at: init.index });
		}

		this.container = container;
	}

	// tslint:disable-next-line:no-any
	public setPropertyValue(id: string, value: any, path?: string): void {
		let property: Property | undefined;
		if (this.pattern) {
			property = this.pattern.getProperty(id, path);
			if (!property) {
				console.warn(`Unknown property '${id}' in pattern '${this.pattern.getId()}'`);
			}
		}

		const coercedValue = property ? property.coerceValue(value) : value;
		if (path) {
			const rootPropertyValue = this.properties.get(id) || {};
			ObjectPath.set<{}, Types.PropertyValue>(rootPropertyValue, path, coercedValue);
			this.properties.set(id, deepAssign({}, rootPropertyValue));
		} else {
			this.properties.set(id, coercedValue);
		}
	}

	/**
	 * Serializes the page element into a JSON object for persistence.
	 * @param forRendering Whether all property values should be converted using
	 * Property.convertToRender (for the preview app instead of file persistence).
	 * @return The JSON object to be persisted.
	 */
	public toJSON(props?: { forRendering?: boolean }): Types.SerializedPageElement {
		return {
			contents: this.contents.map(content => content.toJSON()),
			id: this.id,
			name: this.name,
			pattern: this.pattern.getId(),
			properties: toObject(this.properties)
		};
	}
}

function toObject<T>(map: Map<string, T>): { [key: string]: T } {
	const mapLike = {};

	map.forEach((value: T, key) => {
		mapLike[key] = value;
	});

	return mapLike;
}

function toMap<T>(o: { [key: string]: T }): Map<string, T> {
	const map = new Map();

	Object.keys(o).forEach(key => {
		map.set(key, o[key]);
	});

	return map;
}
