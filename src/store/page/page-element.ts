import * as deepAssign from 'deep-assign';
import { JsonArray, JsonObject, JsonValue } from '../json';
import * as MobX from 'mobx';
import * as ObjectPath from 'object-path';
import { Page } from './page';
import { Pattern } from '../styleguide/pattern';
import { Property } from '../styleguide/property/property';
import { PropertyValue } from './property-value';
import { Store } from '../store';
import { StringProperty } from '../styleguide/property/string-property';
import { Styleguide } from '../styleguide/styleguide';
import * as Uuid from 'uuid';

export interface PageElementProperties {
	id?: string;
	parent?: PageElement;
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
	 * The child page elements of this element.
	 */
	@MobX.observable private children: PageElement[] = [];

	/**
	 * The technical (internal) ID of the page element.
	 */
	@MobX.observable private id: string;

	/**
	 * The assigned name of the page element, initially the pattern's human-friendly name.
	 */
	@MobX.observable private name: string;

	/**
	 * The page this element belongs to.
	 */
	private page?: Page;

	/**
	 * The parent page element if this is not the root element.
	 */
	private parent: PageElement | undefined;

	/**
	 * The pattern this page element reflects. Usually set, may only the undefined if the pattern
	 * has disappeared or got invalid in the mean-time.
	 */
	private pattern?: Pattern;

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

		if (this.name === undefined && this.pattern) {
			this.name = this.pattern.getName();
		}

		if (properties.setDefaults && this.pattern) {
			this.pattern.getProperties().forEach(property => {
				this.setPropertyValue(property.getId(), property.getDefaultValue());
			});
		}

		this.setParent(properties.parent);
	}

	/**
	 * Loads and returns a page element from a given JSON object.
	 * @param jsonObject The JSON object to load from.
	 * @return A new page element object containing the loaded data.
	 */
	public static fromJsonObject(
		json: JsonObject,
		parent?: PageElement,
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

		if (!pattern) {
			console.warn(`Ignoring unknown pattern "${patternId}"`);
			return new PageElement({ parent });
		}

		const element = new PageElement({ id: json.uuid as string, pattern, parent });

		if (json.name !== undefined) {
			element.name = json.name as string;
		}

		if (json.properties) {
			Object.keys(json.properties as JsonObject).forEach((propertyId: string) => {
				const value: JsonValue = (json.properties as JsonObject)[propertyId];
				element.setPropertyValue(propertyId, element.createPropertyValue(value));
			});
		}

		if (json.children) {
			element.children = (json.children as JsonArray).map(
				(childJson: JsonObject) => element.createChildElement(childJson) as PageElement
			);
		}

		return element;
	}

	/**
	 * Adds a child element to is element (and removes it from any other parent).
	 * @param child The child element to add.
	 * @param index The 0-based new position within the children.
	 * Leaving out the position adds it at the end of the list.
	 */
	public addChild(child: PageElement, index?: number): void {
		child.setParent(this, index);
	}

	/**
	 * Returns a deep clone of this page element (i.e. cloning all values and children as well).
	 * The new clone does not have any parent.
	 * @return The new clone.
	 */
	public clone(): PageElement {
		const clone = new PageElement({ pattern: this.pattern });
		this.children.forEach(child => {
			clone.addChild(child.clone());
		});
		this.propertyValues.forEach((value: PropertyValue, id: string) => {
			clone.setPropertyValue(id, value);
		});
		return clone;
	}

	/**
	 * Creates a child element (pattern or text) for a given serialization JSON.
	 * @param json The JSON to read from.
	 * @return The new child element.
	 */
	protected createChildElement(json: JsonValue): PageElement | PropertyValue {
		if (json && (json as JsonObject)['_type'] === 'pattern') {
			return PageElement.fromJsonObject(json as JsonObject, this);
		} else {
			const store: Store = Store.getInstance();
			const styleguide = store.getStyleguide() as Styleguide;

			const element: PageElement = new PageElement({
				pattern: styleguide.getPattern(Pattern.SYNTHETIC_TEXT_ID),
				setDefaults: false,
				parent: this
			});
			element.setPropertyValue(StringProperty.SYNTHETIC_TEXT_ID, String(json));
			return element;
		}
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
	 * Returns the child page elements of this element.
	 * @return The child page elements of this element.
	 */
	public getChildren(): PageElement[] {
		return this.children;
	}

	/**
	 * Returns the technical (internal) ID of the page.
	 * @return The technical (internal) ID of the page.
	 */
	public getId(): string {
		return this.id;
	}

	/**
	 * Returns the 0-based position of this element within its parent.
	 * @return The 0-based position of this element.
	 */
	public getIndex(): number {
		if (!this.parent) {
			throw new Error('This element has no parent');
		}
		return this.parent.children.indexOf(this);
	}

	/**
	 * Returns the assigned name of the page element, initially the pattern's human-friendly name.
	 * @return The assigned name of the page element.
	 */
	public getName(): string {
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
		if (value instanceof PageElement) {
			return value.toJsonObject();
		} else if (value instanceof Object) {
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
		this.setParent(this.parent, index);
	}

	/**
	 * Sets the assigned name of the page element, initially the pattern's human-friendly name.
	 * @param name The assigned name of the page element.
	 */
	public setName(name: string): void {
		this.name = name;
	}

	/**
	 * Sets a new parent for this element (and removes it from its previous parent).
	 * If no parent is provided, only removes it from its parent.
	 * @param parent The (optional) new parent for this element.
	 * @param index The 0-based new position within the children of the new parent.
	 * Leaving out the position adds it at the end of the list.
	 */
	public setParent(parent?: PageElement, index?: number): void {
		this.setParentInternal(parent, index, parent ? parent.getPage() : undefined);
	}

	/**
	 * Internal method to set the parent, index, and page the root belongs to.
	 * Do not call from components code.
	 * @param parent The (optional) new parent for this element.
	 * @param index The 0-based new position within the children of the new parent.
	 * Leaving out the position adds it at the end of the list.
	 * @param page The page of this element.
	 */
	public setParentInternal(parent?: PageElement, index?: number, page?: Page): void {
		if (index !== undefined && this.parent === parent && this.children.indexOf(this) === index) {
			return;
		}

		if (this.parent) {
			(this.parent.children as MobX.IObservableArray<PageElement>).remove(this);
		}

		if (this.page) {
			this.page.unregisterElementAndChildren(this);
		}

		this.parent = parent;
		this.updatePageInDescendants(page);

		if (parent) {
			if (index === undefined || index >= parent.children.length) {
				parent.children.push(this);
			} else {
				parent.children.splice(index < 0 ? 0 : index, 0, this);
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
		if (!this.pattern) {
			return;
		}

		const property: Property | undefined = this.pattern.getProperty(id, path);

		if (!property) {
			return;
		}

		(async () => {
			const coercedValue: string = await property.coerceValue(value);
			if (path) {
				const rootPropertyValue = this.propertyValues.get(id) || {};
				ObjectPath.set<{}, PropertyValue>(rootPropertyValue, path, coercedValue);
				this.propertyValues.set(id, deepAssign({}, rootPropertyValue));
			} else {
				this.propertyValues.set(id, coercedValue);
			}
		})().catch(reason => {
			console.log(
				`Failed to coerce property value of property ${this.getId()} of pattern ${this.getPattern()}: ${reason}`
			);
		});
	}

	/**
	 * Serializes the page element into a JSON object for persistence.
	 * @return The JSON object to be persisted.
	 */
	public toJsonObject(): JsonObject {
		const json: JsonObject = {
			_type: 'pattern',
			uuid: this.id,
			name: this.name,
			pattern: this.pattern && this.pattern.getId()
		};

		json.children = this.children.map(
			(element: PageElement) =>
				// tslint:disable-next-line:no-any
				element.toJsonObject ? element.toJsonObject() : (element as any)
		);
		json.properties = {};

		this.propertyValues.forEach((value: PropertyValue, key: string) => {
			(json.properties as JsonObject)[key] =
				value !== null && value !== undefined ? this.propertyToJsonValue(value) : value;
		});

		return json;
	}

	/**
	 * Updates the page property in this element and all its descendants
	 * @param page The new page.
	 */
	private updatePageInDescendants(page?: Page): void {
		this.page = page;
		this.children.forEach(child => child.updatePageInDescendants(page));
	}
}
