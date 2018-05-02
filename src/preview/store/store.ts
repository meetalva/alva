import { HighlightArea } from './highlight-area';
import * as MobX from 'mobx';
import { Page } from './page';

export class Store {
	/**
	 * The store singleton instance.
	 */
	private static INSTANCE: Store;

	public connection: WebSocket;
	@MobX.observable public currentPageId: string = '';
	@MobX.observable public highlightArea: HighlightArea;
	@MobX.observable public pages: Page[] = [];
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

	/**
	 * Returns the currently open page, or undefined, if no page is open.
	 * @return The currently open page.
	 */
	public getCurrentPage(): Page | undefined {
		return this.pages.find(page => page.id === this.currentPageId);
	}

	// tslint:disable-next-line:no-any
	public setFromData(data?: any): void {
		if (!data || !data.hasOwnProperty('payload')) {
			return;
		}

		const payload = data.payload;

		if (payload.currentPageId) {
			this.currentPageId = payload.currentPageId;
		}

		if (payload.pages) {
			this.pages = payload.pages;
		}
	}
}
