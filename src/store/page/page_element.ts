import { JsonArray, JsonObject, JsonValue } from '../json';
import * as MobX from 'mobx';
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

	public static fromJsonObject(json: JsonObject, store: Store, parent?: PageElement): PageElement {
		const element = new PageElement();
		element.parent = parent;

		element.patternPath = json['pattern'] as string;
		if (store) {
			const pattern: Pattern | undefined = store.getPattern(element.patternPath);
			if (pattern) {
				element.pattern = pattern;
			} else {
				console.warn(`Ignoring unknown pattern "${element.patternPath}"`);
				return element;
			}
		}

		if (json.properties) {
			Object.keys(json.properties as JsonObject).forEach((propertyId: string) => {
				const value: JsonValue = (json.properties as JsonObject)[propertyId];
				element.setPropertyValue(propertyId, element.createElementOrValue(value, store));
			});
		}

		if (json.children) {
			element.children = (json.children as JsonArray).map(
				(childJson: JsonObject) => element.createElementOrValue(childJson, store) as PageElement
			);
		}

		return element;
	}

	protected createElementOrValue(json: JsonValue, store: Store): PageElement | PropertyValue {
		if (json && (json as JsonObject)['_type'] === 'pattern') {
			return PageElement.fromJsonObject(json as JsonObject, store, this);
		} else {
			return json as PropertyValue;
		}
	}

	public getChildren(): PageElement[] {
		return this.children;
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
				value !== null && value !== undefined ? this.valueToJson(value) : value;
		});

		return json;
	}

	protected valueToJson(value: PropertyValue): JsonValue {
		if (value instanceof PageElement) {
			return value.toJsonObject();
		} else if (value instanceof Object) {
			const jsonObject: JsonObject = {};
			Object.keys(value).forEach((propertyId: string) => {
				// tslint:disable-next-line:no-any
				jsonObject[propertyId] = this.valueToJson((value as any)[propertyId]);
			});
			return jsonObject;
		} else {
			return value as JsonValue;
		}
	}
}
