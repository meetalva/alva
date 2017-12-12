import { Property } from '.';

export class EnumProperty extends Property {
	private options: Option[];
	private ordinalById: { [id: string]: number } = {};

	public constructor(id: string, name: string, required: boolean, options: Option[]) {
		super(id, name, required);
		this.options = options;
		this.options.forEach((option: Option) => {
			this.ordinalById[option.getId()] = option.getOrdinal();
		});
	}

	// tslint:disable-next-line:no-any
	public convertToProperty(value: any): any {
		console.log(`Converted from ${value} to ${this.ordinalById[value as string]}`);
		return this.ordinalById[value as string];
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
	private ordinal: number;

	public constructor(id: string, name: string, ordinal: number) {
		this.id = id;
		this.name = name;
		this.ordinal = ordinal;
	}

	public getId(): string {
		return this.id;
	}

	public getName(): string {
		return this.name;
	}

	public getOrdinal(): number {
		return this.ordinal;
	}

	public toString(): string {
		return `Option(id="${this.id}", name="${this.name}")`;
	}
}
