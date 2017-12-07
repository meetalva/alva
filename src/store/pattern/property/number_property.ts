import { Property } from '.';

export class NumberProperty extends Property {
	public constructor(id: string, name: string, required: boolean) {
		super(id, name, required);
	}

	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		if (value === null || value === undefined || value === '') {
			return undefined;
		}

		return parseFloat(value);
	}

	public getType(): string {
		return 'number';
	}

	public toString(): string {
		return `NumberProperty(id="${this.getId()}", required="${this.isRequired()}")`;
	}
}
