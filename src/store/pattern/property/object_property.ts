import { Property } from '.';

export class ObjectProperty extends Property {
	private properties: Map<string, Property> = new Map();

	public constructor(id: string) {
		super(id);
	}

	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		if (value === null || value === undefined || value === '') {
			return undefined;
		}

		return value;
	}

	public getProperties(): Property[] {
		return Array.from(this.properties.values());
	}

	public getProperty(id: string): Property | undefined {
		return this.properties.get(id);
	}

	public getType(): string {
		return 'object';
	}

	public toString(): string {
		return `ObjectProperty(id="${this.getId()}", required="${this.isRequired()}")`;
	}
}
