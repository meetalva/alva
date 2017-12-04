export class Property {
	public name: string;
	public displayName: string;
	public type: string;
	public required: boolean;

	public toString(): string {
		return `Property(name="${this.name}", type="${this.type}", required="${this.required}")`;
	}
}
