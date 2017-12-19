import { Property } from './property';

export class NumberProperty extends Property {
	public constructor(id: string) {
		super(id);
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
		return `NumberProperty(${super.toString()})`;
	}
}
