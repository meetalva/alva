import { JsonArray, JsonObject, JsonValue } from '../json';
import * as MobX from 'mobx';
import * as PathUtils from 'path';
import { Pattern } from '../pattern/pattern';
import { Property } from '../pattern/property/property';
import { PropertyValue } from './property_value';
import { Store } from '../store';

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
	 * The parent page element if this is not the root element.
	 */
	private parent: PageElement | undefined;

	/**
	 * The pattern this page element reflects. Usually set, may only the undefined if the pattern
	 * has disappeared or got invalid in the mean-time.
	 */
	private pattern?: Pattern;

	/**
	 * The relative path to the built pattern files folder, in terms of Pattern.getRelativePath().
	 */
	private patternPath: string;

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
	public constructor(pattern?: Pattern, setDefaults?: boolean, parent?: PageElement) {
		this.pattern = pattern;
		this.patternPath = pattern ? pattern.getRelativePath().replace(PathUtils.sep, '/') : '';

		if (setDefaults && this.pattern) {
			this.pattern.getProperties().forEach(property => {
				this.setPropertyValue(property.getId(), property.getDefaultValue());
				console.log(
					`Property ${property.getId()}: Set default ${JSON.stringify(
						this.getPropertyValue(property.getId())
					)}`
				);
			});
		}

		this.setParent(parent);
	}

	/**
	 * Loads and returns a page element from a given JSON object.
	 * @param jsonObject The JSON object to load from.
	 * @return A new page element object containing the loaded data.
	 */
	public static fromJsonObject(
		json: JsonObject,
		store: Store,
		parent?: PageElement
	): PageElement | undefined {
		const patternPath: string = json['pattern'] as string;
		const pattern: Pattern | undefined = store.getPattern(patternPath);
		const element = new PageElement(pattern, false, parent);

		if (!pattern) {
			console.warn(`Ignoring unknown pattern "${patternPath}"`);
			element.patternPath = patternPath;
			return element;
		}

		if (json.properties) {
			Object.keys(json.properties as JsonObject).forEach((propertyId: string) => {
				const value: JsonValue = (json.properties as JsonObject)[propertyId];
				element.setPropertyValue(propertyId, element.createPropertyValue(value, store));
			});
		}

		if (json.children) {
			element.children = (json.children as JsonArray).map(
				(childJson: JsonObject) => element.createChildElement(childJson, store) as PageElement
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
	 * Adds a page element as another child of this element's parent, directly after this element.
	 * Also removes the element from any previous parent.
	 * @param child The child element to add.
	 */
	public addSibling(child: PageElement): void {
		const parentElement: PageElement | undefined = this.getParent();
		if (parentElement) {
			child.setParent(parentElement, this.getIndex() + 1);
		}
	}

	/**
	 * Returns a deep clone of this page element (i.e. cloning all values and children as well).
	 * The new clone does not have any parent.
	 * @return The new clone.
	 */
	public clone(): PageElement {
		const clone = new PageElement(this.pattern);
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
	 * @param store The application's store.
	 * @return The new child element.
	 */
	protected createChildElement(json: JsonValue, store: Store): PageElement | PropertyValue {
		if (json && (json as JsonObject)['_type'] === 'pattern') {
			return PageElement.fromJsonObject(json as JsonObject, store, this);
		} else {
			const element: PageElement = new PageElement(store.getPattern('text'), false, this);
			element.setPropertyValue('text', String(json));
			return element;
		}
	}

	/**
	 * Creates a property value or element for a given serialization JSON.
	 * @param json The JSON to read from.
	 * @param store The application's store.
	 * @return The new property value or element.
	 */
	protected createPropertyValue(json: JsonValue, store: Store): PageElement | PropertyValue {
		if (json && (json as JsonObject)['_type'] === 'pattern') {
			return PageElement.fromJsonObject(json as JsonObject, store, this);
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
	 * Returns the relative path to the built pattern files folder,
	 * in terms of Pattern.getRelativePath().
	 * @return The relative path to the built pattern files folder.
	 */
	public getPatternPath(): string {
		return this.patternPath;
	}

	/**
	 * The content of a property of this page element.
	 * @param id The ID of the property to return the value of.
	 * @return The content value (as provided by the designer).
	 */
	public getPropertyValue(id: string): PropertyValue {
		const value: PropertyValue = this.propertyValues.get(id);

		return value;
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
	 * Sets a new parent for this element (and removes it from its previous parent).
	 * If no parent is provided, only removes it from its parent.
	 * @param parent The (optional) new parent for this element.
	 * @param index The 0-based new position within the children of the new parent.
	 * Leaving out the position adds it at the end of the list.
	 */
	public setParent(parent?: PageElement, index?: number): void {
		if (index !== undefined && this.parent === parent && this.children.indexOf(this) === index) {
			return;
		}

		if (this.parent) {
			(this.parent.children as MobX.IObservableArray<PageElement>).remove(this);
		}

		this.parent = parent;

		if (parent) {
			if (index === undefined || index >= parent.children.length) {
				parent.children.push(this);
			} else {
				parent.children.splice(index < 0 ? 0 : index, 0, this);
			}
		}
	}

	/**
	 * Sets a property value (designer content) for this page element.
	 * Any given value is automatically converted to be compatible to the property type.
	 * For instance, the string "true" is converted to true if the property is boolean.
	 * @param id The ID of the property to set the value for.
	 * @param value The value to set (which is automatically converted, see above).
	 */
	// tslint:disable-next-line:no-any
	public setPropertyValue(id: string, value: any): void {
		if (this.pattern) {
			const property: Property | undefined = this.pattern.getProperty(id);
			if (property) {
				value = property.coerceValue(value);
			}
		}

		this.propertyValues.set(id, value);
	}

	/**
	 * Serializes the page element into a JSON object for persistence.
	 * @return The JSON object to be persisted.
	 */
	public toJsonObject(): JsonObject {
		const json: JsonObject = { _type: 'pattern', pattern: this.patternPath };

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
}
