export class Folder<T> {
	private name: string;
	private path: string | undefined;
	private items: T[] = [];
	private subFolders: Folder<T>[] = [];

	public constructor(name: string, path?: string) {
		this.name = name;
		this.path = path;
	}

	public getName(): string {
		return this.name;
	}

	public setName(name: string): void {
		this.name = name;
	}

	public getPath(): string | undefined {
		return this.path;
	}

	public setPath(path: string | undefined): void {
		this.path = path;
	}

	public getItems(): T[] {
		return this.items;
	}

	public setItems(patterns: T[]): void {
		this.items = patterns;
	}

	public getSubFolders(): Folder<T>[] {
		return this.subFolders;
	}

	public setSubFolders(subFolders: Folder<T>[]): void {
		this.subFolders = subFolders;
	}

	public find(callback: (item: T) => boolean): T | undefined {
		for (const item of this.getItems()) {
			if (callback(item)) {
				return item;
			}
		}

		for (const subFolder of this.getSubFolders()) {
			return subFolder.find(callback);
		}

		return undefined;
	}

	public flatten(): T[] {
		let result: T[] = [];

		for (const item of this.items) {
			result.push(item);
		}

		for (const subFolder of this.subFolders) {
			result = result.concat(subFolder.flatten());
		}

		return result;
	}

	public totalItems(): number {
		let totalItems = this.items.length;

		for (const subFolder of this.subFolders) {
			totalItems += subFolder.totalItems();
		}

		return totalItems;
	}
}
