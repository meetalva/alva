import * as Types from './types';

export class EditHistory {
	private items: Types.EditHistoryItem[] = [];
	private pointer: number | undefined;

	public back(): Types.EditHistoryItem | undefined {
		if (typeof this.pointer === 'undefined') {
			this.pointer = Math.max(this.items.length - 1, 0);
		}

		if (this.items.length === 0) {
			return;
		}

		this.pointer = Math.max(this.pointer - 1, 0);
		const item = this.items[this.pointer];
		return item;
	}

	public clear(): void {
		this.items = [];
		this.pointer = undefined;
	}

	public forward(): Types.EditHistoryItem | undefined {
		if (typeof this.pointer === 'undefined') {
			this.pointer = Math.max(this.items.length - 1, 0);
		}

		if (this.items.length === 0) {
			return;
		}

		this.pointer = Math.min(this.pointer + 1, this.items.length - 1);
		return this.items[this.pointer];
	}

	public push(item: Types.EditHistoryItem): void {
		if (typeof this.pointer === 'undefined') {
			this.pointer = this.items.length - 1;
		}

		this.items = this.items.slice(0, this.pointer + 1);
		this.items.push(item);

		this.pointer = Math.max(this.items.length - 1, 0);
	}
}
