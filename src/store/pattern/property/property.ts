export abstract class Property {
	// tslint:disable-next-line:no-any
	private defaultValue: any;
	private id: string;
	private hidden: boolean = false;
	private name: string;
	private required: boolean = false;

	public constructor(id: string) {
		this.id = id;
		// sic: We start with the ID as name
		this.name = id;
	}

	// tslint:disable-next-line:no-any
	protected arraysAndEqual(value1: any, value2: any): boolean {
		if (!(value1 instanceof Array) || !(value2 instanceof Array)) {
			return false;
		}

		// tslint:disable-next-line:no-any
		const array1: any[] = value1;
		// tslint:disable-next-line:no-any
		const array2: any[] = value2;
		if (array1.length !== array2.length) {
			return false;
		}

		for (let i = 0; i < array1.length; i++) {
			if (array1[i] !== array2[i]) {
				return false;
			}
		}

		return true;
	}

	// tslint:disable-next-line:no-any
	protected coerceArrayValue(value: any, elementCoercion: (value: any) => any): any {
		// tslint:disable-next-line:no-any
		let result: any[];
		if (value instanceof Array) {
			result = value;
		} else {
			result = [value];
		}

		// tslint:disable-next-line:no-any
		result = value.filter(
			// tslint:disable-next-line:no-any
			(element: any) => value !== null && value !== undefined && value !== ''
		);

		// tslint:disable-next-line:no-any
		result = result.map(elementCoercion);

		// Ensure that unmodified arrays stay the same
		return this.arraysAndEqual(value, result) ? value : result;
	}

	// tslint:disable-next-line:no-any
	public abstract coerceValue(value: any): any;

	// tslint:disable-next-line:no-any
	public convertToProperty(value: any): any {
		return value;
	}

	// tslint:disable-next-line:no-any
	public getDefaultValue(): any {
		return this.defaultValue;
	}

	public getId(): string {
		return this.id;
	}

	public getName(): string {
		return this.name;
	}

	// tslint:disable-next-line:no-any
	protected getToStringProperties(): [string, any][] {
		return [
			['id', this.id],
			['name', this.name],
			['required', this.required],
			['default', this.defaultValue]
		];
	}

	public abstract getType(): string;

	public isHidden(): boolean {
		return this.hidden;
	}

	public isRequired(): boolean {
		return this.required;
	}

	// tslint:disable-next-line:no-any
	public setDefaultValue(defaultValue: any): void {
		this.defaultValue = defaultValue;
	}

	public setHidden(hidden: boolean): void {
		this.hidden = hidden;
	}

	public setName(name: string): void {
		this.name = name;
	}

	public setRequired(required: boolean): void {
		this.required = required;
	}

	public toString(): string {
		// tslint:disable-next-line:no-any
		const properties: [string, any][] = this.getToStringProperties();
		return properties.map(([id, value]) => `${id}=${JSON.stringify(value)}`).join(', ');
	}
}
