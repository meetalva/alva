export abstract class Property {
	private id: string;
	private name: string;
	private required: boolean;

	public constructor(id: string, name: string, required: boolean) {
		this.id = id;
		this.name = name;
		this.required = required;
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

	public getId(): string {
		return this.id;
	}

	public getName(): string {
		return this.name;
	}

	public isRequired(): boolean {
		return this.required;
	}

	public abstract getType(): string;
}
