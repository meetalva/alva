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
