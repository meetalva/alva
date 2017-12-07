import { Property } from '.';

export class EnumProperty extends Property {
	private options: Option[];

	public constructor(id: string, name: string, required: boolean, options: Option[]) {
		super(id, name, required);
		this.options = options;
	}

	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		if (value === null || value === undefined || value === '') {
			return undefined;
		}

		return String(value);
	}

	public getOptions(): Option[] {
		return this.options;
	}

	public getType(): string {
		return 'enum';
	}

	public toString(): string {
		return `EnumProperty(id="${this.getId()}", required="${this.isRequired()}")`;
	}
}

export class Option {
	private id: string;
	private name: string;

	public constructor(id: string, name: string) {
		this.id = id;
		this.name = name;
	}

	public getId(): string {
		return this.id;
	}

	public getName(): string {
		return this.name;
	}

	public toString(): string {
		return `Option(id="${this.id}", name="${this.name}")`;
	}
}
