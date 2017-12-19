import { Property } from './property';

export class StringProperty extends Property {
	public constructor(id: string) {
		super(id);
	}

	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		if (value === null || value === undefined || value === '') {
			return '';
		}

		return String(value);
	}

	public getType(): string {
		return 'string';
	}

	public toString(): string {
		return `StringProperty(${super.toString()})`;
	}
}
