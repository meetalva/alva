import * as deepAssign from 'deep-assign';
import { JsonArray, JsonObject, JsonValue } from '../json';
import * as MobX from 'mobx';
import * as ObjectPath from 'object-path';
import { Page } from './page';
import { Pattern } from '../styleguide/pattern';
import { Property } from '../styleguide/property/property';
import { PropertyValue } from './property-value';
import { Store } from '../store';
import * as Uuid from 'uuid';

export interface PageElementProperties {
	id?: string;
	parent?: PageElement;
	parentSlotId?: string;
	pattern?: Pattern;
	setDefaults?: boolean;
}

/**
 * A page element provides the properties data of a pattern.
 * It represents the pattern component instance from a designer's point-of-view.
 * Page elements are nested within a page.
 */
export class PageElement {
	/**
	 * The content page elements of this element.
	 * Key = Slot ID, Value = Slot contents.
	 */
	@MobX.observable private contents: Map<string, PageElement[]> = new Map();

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
	private parent: PageElement | undefined;

	/**
	 * The id of the slot this element is attached to.
	 * Undefined means default slot. (for react it's the `children` property)
	 */
	private parentSlotId: string | undefined;

	/**
	 * The pattern this page element reflects. Usually set, may only the undefined if the pattern
	 * has disappeared or got invalid in the mean-time.
	 */
	private pattern?: Pattern;

	/**
	 * The ID of the pattern this page element reflects. This is a cached value equal to the ID of
	 * the pattern property, for cases where the pattern could not be resolved on load, to not lose
	 * the ID on save.
	 */
	private patternId?: string;

	/**
	 * The pattern property values of this element's component instance.
	 * Each key represents the property ID of the pattern, while the value holds the content
	 * as provided by the designer.
	 */
	@MobX.observable private propertyValues: Map<string, PropertyValue> = new Map();

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
		this.patternId = this.pattern ? this.pattern.getId() : undefined;
		this.parentSlotId = properties.parentSlotId;
		this.nameEditable = false;

		if (this.name === undefined && this.pattern) {
			this.name = this.pattern.getName();
		}

		if (properties.setDefaults && this.pattern) {
			this.pattern.getProperties().forEach(property => {
				this.setPropertyValue(property.getId(), property.getDefaultValue());
			});
		}

		this.setParent(properties.parent, properties.parentSlotId);
	}

	/**
	 * Loads and returns a page element from a given JSON object.
	 * @param jsonObject The JSON object to load from.
	 * @return A new page element object containing the loaded data.
	 */
	public static fromJsonObject(
		json: JsonObject,
		parent?: PageElement,
		parentSlotId?: string,
		page?: Page
	): PageElement | undefined {
		if (!json) {
			return undefined;
		}

		const store: Store = Store.getInstance();
		const styleguide = store.getStyleguide();
		if (!styleguide) {
			return undefined;
		}

		let patternId = json['pattern'] as string;
		let pattern: Pattern | undefined = styleguide.getPattern(patternId);

		if (!pattern) {
			const indexPatternId = `${patternId}/index`;
			pattern = styleguide.getPattern(indexPatternId);
			if (pattern) {
				patternId = indexPatternId;
			}
		}

		if (!pattern && patternId) {
			console.warn(`Unknown pattern '${patternId}', please check styleguide`);
		}

		const element = new PageElement({ id: json.uuid as string, pattern, parent, parentSlotId });
		element.patternId = patternId;

		if (json.name !== undefined) {
			element.name = json.name as string;
		}

		if (json.properties) {
			Object.keys(json.properties as JsonObject).forEach((propertyId: string) => {
				const value: JsonValue = (json.properties as JsonObject)[propertyId];
				element.setPropertyValue(propertyId, element.createPropertyValue(value));
			});
		}

		if (json.contents) {
			const slots = json.contents as JsonObject;

			Object.keys(slots).forEach(slotId => {
				(slots[slotId] as JsonArray).map(
					childElement =>
						PageElement.fromJsonObject(
							childElement as JsonObject,
							element,
							slotId
						) as PageElement
				);
			});
		}

		// Migrate old children structure
		if (json.children) {
			const children: JsonArray = json.children as JsonArray;
			children.forEach(
				childElement =>
					PageElement.fromJsonObject(childElement as JsonObject, element) as PageElement
			);
		}

		return element;
	}

	/**
	 * Adds a child element to is element (and removes it from any other parent).
	 * @param child The child element to add.
	 * @param slotId This indicates the slot, that the element will be attached to. When undefined, the default slot will be used instead.
	 * @param index The 0-based new position within the children. Leaving out the position adds it at the end of the list.
	 */
	public addChild(child: PageElement, slotId?: string, index?: number): void {
		child.setParent(this, slotId, index);
	}

	/**
	 * Returns a deep clone of this page element (i.e. cloning all values and children as well).
	 * The new clone has neither a parent, nor a slotId.
	 * @return The new clone.
	 */
	public clone(): PageElement {
		const clone = new PageElement({ pattern: this.pattern });

		this.contents.forEach((children, slotId) => {
			children.forEach(child => {
				clone.addChild(child.clone(), slotId);
			});
		});

		this.propertyValues.forEach((value: PropertyValue, id: string) => {
			clone.setPropertyValue(id, value);
		});

		return clone;
	}

	/**
	 * Creates a property value or element for a given serialization JSON.
	 * @param json The JSON to read from.
	 * @return The new property value or element.
	 */
	protected createPropertyValue(json: JsonValue): PageElement | PropertyValue {
		if (json && (json as JsonObject)['_type'] === 'pattern') {
			return PageElement.fromJsonObject(json as JsonObject, this);
		} else {
			return json as PropertyValue;
		}
	}

	/**
	 * Returns all child elements contained by this element, mapped to their containing slots.
	 */
	public getContents(): Map<string, PageElement[]> {
		return this.contents;
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
	public getIndex(): number | undefined {
		if (!this.parent) {
			return undefined;
		}
		return this.parent.getSlotContents(this.parentSlotId).indexOf(this);
	}

	/**
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
		return this.page;
	}

	/**
	 * Returns the parent page element if this is not the root element.
	 * @return The parent page element or undefined.
	 */
	public getParent(): PageElement | undefined {
		return this.parent;
	}

	/**
	 * Returns the id of the slot this element is attached to.
	 * @return The slotId of the parent element.
	 */
	public getParentSlotId(): string | undefined {
		return this.parentSlotId;
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
	public getPropertyValue(id: string, path?: string): PropertyValue {
		const value: PropertyValue = this.propertyValues.get(id);

		if (!path) {
			return value;
		}

		return ObjectPath.get(value as {}, path);
	}

	/**
	 * Returns the child page elements of this element for a given slot.
	 * @param slotId The id of the slot to get the children for. Returns the children of the default slot if undefined.
	 * @return The child page elements of this element and the given slot.
	 */
	@MobX.action
	public getSlotContents(slotId?: string): PageElement[] {
		const internalSlotId = slotId || Pattern.DEFAULT_SLOT_PROPERTY_NAME;

		if (!this.contents.has(internalSlotId)) {
			this.contents.set(internalSlotId, []);
		}

		return this.contents.get(internalSlotId) as PageElement[];
	}

	/**
	 * Returns whether this element is an ancestor of a given child.
	 * Ancestors of a given element are the element itself,
	 * the parents of the element, and the parents of ancestors of the element.
	 * If the given child is empty, this method returns false.
	 * @param child The child to test.
	 * @return Whether this element is an ancestor of the given child.
	 */
	public isAncestorOf(child?: PageElement): boolean {
		if (!child) {
			return false;
		} else if (child === this) {
			return true;
		} else {
			return this.isAncestorOf(child.getParent());
		}
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
		return this.parent === undefined;
	}

	/**
	 * Returns a JSON value (serializable JavaScript object) for a given property value.
	 * @return value The property value to serialize.
	 * @return The JSON value.
	 */
	protected propertyToJsonValue(value: PropertyValue): JsonValue {
		if (value instanceof Object) {
			const jsonObject: JsonObject = {};
			Object.keys(value).forEach((propertyId: string) => {
				// tslint:disable-next-line:no-any
				jsonObject[propertyId] = this.propertyToJsonValue((value as any)[propertyId]);
			});
			return jsonObject;
		} else {
			return value as JsonValue;
		}
	}

	/**
	 * Removes this page element from its parent. You may later re-add it using setParent().
	 * @see setParent()
	 */
	public remove(): void {
		this.setParent(undefined);
	}

	/**
	 * Moves this page element to a new position within its parent
	 * @param index The new 0-based position within the parent's children.
	 */
	public setIndex(index: number): void {
		this.setParent(this.parent, this.parentSlotId, index);
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

	/**
	 * Sets a new parent for this element (and removes it from its previous parent).
	 * If no parent is provided, only removes it from its parent.
	 * @param parent The (optional) new parent for this element.
	 * @param index The 0-based new position within the children of the new parent.
	 * @param slotId The slot to attach the element to. When undefined the default slot is used.
	 * Leaving out the position adds it at the end of the list.
	 */
	public setParent(parent?: PageElement, slotId?: string, index?: number): void {
		this.setParentInternal(parent, slotId, index, parent ? parent.getPage() : undefined);
	}

	/**
	 * Internal method to set the parent, index, and page the root belongs to.
	 * Do not call from components code.
	 * @param parent The (optional) new parent for this element.
	 * @param index The 0-based new position within the children of the new parent.
	 * Leaving out the position adds it at the end of the list.
	 * @param slotId The slot to attach the element to. When undefined the default slot is used.
	 * @param page The page of this element.
	 */
	public setParentInternal(
		parent?: PageElement,
		slotId?: string,
		index?: number,
		page?: Page
	): void {
		if (
			index !== undefined &&
			this.parent === parent &&
			this.getIndex() === index &&
			this.parentSlotId === slotId
		) {
			return;
		}

		if (this.parent) {
			(this.parent.getSlotContents(this.parentSlotId) as MobX.IObservableArray<
				PageElement
			>).remove(this);
		}

		if (this.page) {
			this.page.unregisterElementAndChildren(this);
		}

		this.parent = parent;
		this.parentSlotId = slotId;
		this.updatePageInDescendants(page);

		if (parent) {
			if (index === undefined || index >= parent.getSlotContents(slotId).length) {
				parent.getSlotContents(slotId).push(this);
			} else {
				parent.getSlotContents(slotId).splice(index < 0 ? 0 : index, 0, this);
			}
		}

		if (this.page) {
			this.page.registerElementAndChildren(this);
		}
	}

	/**
	 * Sets a property value (designer content) for this page element.
	 * Any given value is automatically converted to be compatible to the property type.
	 * For instance, the string "true" is converted to true if the property is boolean.
	 * @param id The ID of the property to set the value for.
	 * @param path A dot ('.') separated optional path within an object property to point to a deep
	 * property. E.g., setting propertyId to 'image' and path to 'src.srcSet.xs',
	 * the operation edits 'image.src.srcSet.xs' on the element.
	 * @param value The value to set (which is automatically converted, see above).
	 */
	// tslint:disable-next-line:no-any
	public setPropertyValue(id: string, value: any, path?: string): void {
		let property: Property | undefined;
		if (this.pattern) {
			property = this.pattern.getProperty(id, path);
			if (!property) {
				console.warn(`Unknown property '${id}' in pattern '${this.patternId}'`);
			}
		}

		const coercedValue = property ? property.coerceValue(value) : value;
		if (path) {
			const rootPropertyValue = this.propertyValues.get(id) || {};
			ObjectPath.set<{}, PropertyValue>(rootPropertyValue, path, coercedValue);
			this.propertyValues.set(id, deepAssign({}, rootPropertyValue));
		} else {
			this.propertyValues.set(id, coercedValue);
		}
	}

	/**
	 * Serializes the page element into a JSON object for persistence.
	 * @param forRendering Whether all property values should be converted using
	 * Property.convertToRender (for the preview app instead of file persistence).
	 * @return The JSON object to be persisted.
	 */
	public toJsonObject(props?: { forRendering?: boolean }): JsonObject {
		const json: JsonObject = {
			_type: 'pattern',
			uuid: this.id,
			name: this.name,
			pattern: this.patternId,
			exportName: this.pattern ? this.pattern.getExportName() : 'default'
		};

		json.contents = {};
		this.contents.forEach((slotContents, slotId) => {
			(json.contents as JsonObject)[slotId] = slotContents.map(
				(element: PageElement) =>
					// tslint:disable-next-line:no-any
					element.toJsonObject ? element.toJsonObject(props) : (element as any)
			);
		});

		json.properties = {};
		this.propertyValues.forEach((value: PropertyValue, key: string) => {
			if (props && props.forRendering) {
				const pattern: Pattern | undefined = this.getPattern();
				const property: Property | undefined = pattern ? pattern.getProperty(key) : undefined;
				if (property) {
					value = property.convertToRender(value);
				}
			}

			const jsonValue = this.propertyToJsonValue(value);
			(json.properties as JsonObject)[key] = jsonValue;
		});

		return json;
	}

	/**
	 * Updates the page property in this element and all its descendants
	 * @param page The new page.
	 */
	private updatePageInDescendants(page?: Page): void {
		this.page = page;
		this.contents.forEach(slotContents => {
			slotContents.forEach(child => child.updatePageInDescendants(page));
		});
	}
}
