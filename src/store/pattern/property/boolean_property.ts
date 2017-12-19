import { Property } from './property';

export class BooleanProperty extends Property {
	public constructor(id: string) {
		super(id);
	}

	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		return value === true || value === 'true' || value === 1;
	}

	public getType(): string {
		return 'boolean';
	}

	public toString(): string {
		return `BooleanProperty(${super.toString()})`;
	}
}
