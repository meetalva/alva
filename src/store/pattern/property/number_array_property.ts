import { Property } from '.';

export class NumberArrayProperty extends Property {
	public constructor(id: string, name: string, required: boolean) {
		super(id, name, required);
	}

	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		// tslint:disable-next-line:no-any
		return this.coerceArrayValue(value, (element: any) => parseFloat(value));
	}

	public getType(): string {
		return 'number[]';
	}

	public toString(): string {
		return `NumberArrayProperty(id="${this.getId()}", required="${this.isRequired()}")`;
	}
}
