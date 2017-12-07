import { Property } from '.';

export class ObjectProperty extends Property {
	public constructor(id: string, name: string, required: boolean) {
		super(id, name, required);
	}

	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		if (value === null || value === undefined || value === '') {
			return undefined;
		}

		return value;
	}

	public getType(): string {
		return 'object';
	}

	public toString(): string {
		return `ObjectProperty(id="${this.getId()}", required="${this.isRequired()}")`;
	}
}
