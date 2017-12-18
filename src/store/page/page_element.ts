import { JsonArray, JsonObject, JsonValue } from '../json';
import * as MobX from 'mobx';
import * as PathUtils from 'path';
import { Pattern } from '../pattern';
import { Property } from '../pattern/property';
import { PropertyValue } from './property_value';
import { Store } from '..';

export class PageElement {
	@MobX.observable private children: PageElement[] = [];
	private parent: PageElement | undefined;
	private patternPath: string;
	private pattern?: Pattern;
	@MobX.observable private propertyValues: Map<string, PropertyValue> = new Map();

	public constructor(pattern?: Pattern, parent?: PageElement) {
		this.pattern = pattern;
		this.patternPath = pattern ? pattern.getRelativePath().replace(PathUtils.sep, '/') : '';
		this.setParent(parent);
	}

	public static fromJsonObject(
		json: JsonObject,
		store: Store,
		parent?: PageElement
	): PageElement | undefined {
		const patternPath: string = json['pattern'] as string;
		const pattern: Pattern | undefined = store.getPattern(patternPath);
		const element = new PageElement(pattern, parent);

		if (!pattern) {
			console.warn(`Ignoring unknown pattern "${patternPath}"`);
			element.patternPath = patternPath;
			return element;
		}

		if (json.properties) {
			Object.keys(json.properties as JsonObject).forEach((propertyId: string) => {
				const value: JsonValue = (json.properties as JsonObject)[propertyId];
				element.setPropertyValue(
					propertyId,
					element.createPropertyElementOrValue(value, store)
				);
			});
		}

		if (json.children) {
			element.children = (json.children as JsonArray).map(
				(childJson: JsonObject) =>
					element.createChildElementOrValue(childJson, store) as PageElement
			);
		}

		return element;
	}

	public addChild(child: PageElement, index?: number): void {
		child.setParent(this, index);
	}

	public addSibling(child: PageElement): void {
		const parentElement: PageElement | undefined = this.getParent();
		if (parentElement) {
			child.setParent(parentElement, this.getIndex() + 1);
		}
	}

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

	protected createChildElementOrValue(json: JsonValue, store: Store): PageElement | PropertyValue {
		if (json && (json as JsonObject)['_type'] === 'pattern') {
			return PageElement.fromJsonObject(json as JsonObject, store, this);
		} else {
			const element: PageElement = new PageElement(store.getPattern('text'), this);
			element.setPropertyValue('text', String(json));
			return element;
		}
	}

	protected createPropertyElementOrValue(
		json: JsonValue,
		store: Store
	): PageElement | PropertyValue {
		if (json && (json as JsonObject)['_type'] === 'pattern') {
			return PageElement.fromJsonObject(json as JsonObject, store, this);
		} else {
			return json as PropertyValue;
		}
	}

	public getChildren(): PageElement[] {
		return this.children;
	}

	public getIndex(): number {
		if (!this.parent) {
			throw new Error('This element has no parent');
		}
		return this.parent.children.indexOf(this);
	}

	public getParent(): PageElement | undefined {
		return this.parent;
	}

	public getPattern(): Pattern | undefined {
		return this.pattern;
	}

	public getPatternPath(): string {
		return this.patternPath;
	}

	public getPropertyValue(id: string): PropertyValue {
		const value: PropertyValue = this.propertyValues.get(id);

		return value;
	}

	public isRoot(): boolean {
		return this.parent === undefined;
	}

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

	public remove(): void {
		this.setParent(undefined);
	}

	public setIndex(index: number): void {
		this.setParent(this.parent, index);
	}

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
