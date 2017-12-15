import { Property } from '.';

export class StringArrayProperty extends Property {
	public constructor(id: string) {
		super(id);
	}

	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		// tslint:disable-next-line:no-any
		return this.coerceArrayValue(value, (element: any) => String(value));
	}

	public getType(): string {
		return 'string[]';
	}

	public toString(): string {
		return `StringArrayProperty(${super.toString()})`;
	}
}
