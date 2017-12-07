import { Option } from './option';
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
