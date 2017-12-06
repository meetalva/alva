import { PropertyType } from './type';

export class Property {
	private id: string;
	private name: string;
	private required: boolean;
	private type: PropertyType;

	// tslint:disable-next-line:no-any
	public constructor(id: string, name: string, type: PropertyType, required: boolean) {
		this.id = id;
		this.name = name;
		this.type = type;
		this.required = required;
	}

	public getId(): string {
		return this.id;
	}

	public getName(): string {
		return this.name;
	}

	public isRequired(): boolean {
		return this.required;
	}

	public getType(): PropertyType {
		return this.type;
	}

	public toString(): string {
		return `Property(id="${this.id}", type="${this.type}", required="${this.required}")`;
	}
}
