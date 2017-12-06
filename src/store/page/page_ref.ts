export class PageRef {
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
}
