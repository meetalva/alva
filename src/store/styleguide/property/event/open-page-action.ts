import { EventAction } from './event-action';
import { JsonObject } from '../../../json';

/**
 * The first parameter of these functions must be the DOM event (e.g. click, change).
 */
export class OpenPageAction extends EventAction {
	/**
	 * The ID of the page to open.
	 */
	private pageId: string;

	/**
	 * Creates a new open-page action.
	 * @param pageId The ID of the page to open on events.
	 */
	public constructor(props: { pageId: string }) {
		super();
		this.pageId = props.pageId;
	}

	/**
	 * Returns the ID of the page to open.
	 * @return The ID of the page to open.
	 */
	public getPageId(): string {
		return this.pageId;
	}

	/**
	 * @inheritdoc
	 */
	public toJsonObject(): JsonObject {
		return {
			_type: 'open-page-event-action',
			pageId: this.pageId
		};
	}
}
