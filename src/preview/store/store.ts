import { HighlightArea } from './highlight-area';
import * as MobX from 'mobx';
import { Page } from './page';

export class Store {
	/**
	 * The store singleton instance.
	 */
	private static INSTANCE: Store;

	@MobX.observable public highlightArea: HighlightArea;
	@MobX.observable public page?: Page;
	@MobX.observable public selectedElementId: string;

	/**
	 * Creates a new store.
	 */
	private constructor() {
		this.highlightArea = new HighlightArea();
		this.selectedElementId = '';
	}

	/**
	 * Returns (or creates) the one global store instance.
	 * @return The one global store instance.
	 */
	public static getInstance(basePreferencePath?: string): Store {
		if (!Store.INSTANCE) {
			Store.INSTANCE = new Store();
		}

		return Store.INSTANCE;
	}
}
