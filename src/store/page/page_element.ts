import { Pattern } from '../pattern';
import { Property } from '../pattern/property';
import { PropertyValue } from './property_value';
import { Store } from '..';

export class PageElement {
	private children: PageElement[] = [];
	private patternPath: string;
	private pattern?: Pattern;
	private propertyValues: { [id: string]: PropertyValue } = {};

	// tslint:disable-next-line:no-any
	public constructor(json: any, store: Store) {
		this.patternPath = json['pattern'];
		const pattern: Pattern | undefined = store.getPattern(this.patternPath);
		if (pattern) {
			this.pattern = pattern;
		} else {
			console.warn(`Ignoring unknown pattern ${this.patternPath}`);
		}

		if (json.properties) {
			Object.keys(json.properties).forEach((propertyId: string) => {
				// tslint:disable-next-line:no-any
				const value: any = json.properties[propertyId];
				this.setPropertyValue(propertyId, this.createElementOrValue(value, store));
			});
		}

		if (json.children) {
			this.children = json.children.map(
				// tslint:disable-next-line:no-any
				(childJson: any) => this.createElementOrValue(childJson, store)
			);
		}
	}

	// tslint:disable-next-line:no-any
	protected createElementOrValue(json: any, store: Store): PageElement | PropertyValue {
		if (json && json['_type'] === 'pattern') {
			return new PageElement(json, store);
		} else {
			return json;
		}
	}

	public getChildren(): PageElement[] {
		return this.children;
	}

	public getPattern(): Pattern | undefined {
		return this.pattern;
	}

	public getPatternPath(): string {
		return this.patternPath;
	}

	public getPropertyValue(id: string): PropertyValue {
		return this.propertyValues[id];
	}

	// tslint:disable-next-line:no-any
	public setPropertyValue(id: string, value: any): void {
		if (!this.pattern) {
			throw new Error('This element has no pattern');
		}

		const property: Property | undefined = this.pattern.getProperty(id);
		if (!property) {
			console.warn(`Ignoring unknown property "${id}"`);
			return;
		}

		this.propertyValues[id] = property.coerceValue(value);
	}
}
