import { Property } from '.';

export class BooleanProperty extends Property {
	public constructor(id: string, name: string, required: boolean) {
		super(id, name, required);
	}

	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		return value && (value === true || value === 'true' || value === 1);
	}

	public getType(): string {
		return 'boolean';
	}

	public toString(): string {
		return `BooleanProperty(id="${this.getId()}", required="${this.isRequired()}")`;
	}
}
