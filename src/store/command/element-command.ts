import { Command } from './command';
import { Page } from '../page/page';
import { PageElement } from '../page/page-element';
import { Store } from '../store';

/**
 * A user operation on a page element, ensuring that the page is loaded and references get
 * refreshed.
 */
export abstract class ElementCommand extends Command {
	/**
	 * The element the user operation is performed on.
	 */
	protected element: PageElement;

	/**
	 * The ID of the element the user operation is performed on,
	 * if the element is already part of a page.
	 */
	protected elementId: string;

	/**
	 * The ID of the page the operation is performed on.
	 */
	protected pageId: string;

	/**
	 * Creates a new user operation on a page element.
	 * @param element The element the user operation is performed on.
	 * @param propertyId The ID of the property to change.
	 * @param value The new value for the property.
	 * @param path A dot ('.') separated optional path within an object property to point to a deep
	 * property. E.g., setting propertyId to 'image' and path to 'src.srcSet.xs',
	 * the operation edits 'image.src.srcSet.xs' on the element.
	 */
	// tslint:disable-next-line:no-any
	public constructor(element: PageElement) {
		super();

		this.element = element;

		// Memorize the element and page IDs.
		// This way, closing and opening a page does not break the command.

		this.elementId = element.getId();
		const page = element.getPage();
		if (page) {
			this.pageId = page.getId();
		}
	}

	/**
	 * Ensures that the page of this command is currently open in the store, and opens it if not.
	 * Then ensures that the element is used from that open page.
	 * @return Whether the operation was successful. On failure, the execute/undo should abort.
	 */
	protected ensurePageAndElement(): boolean {
		let currentPage: Page | undefined = Store.getInstance().getCurrentPage();
		if (!currentPage || currentPage.getId() !== this.pageId) {
			if (!Store.getInstance().openPage(this.pageId)) {
				return false;
			}
			currentPage = Store.getInstance().getCurrentPage() as Page;
		}

		if (this.elementId) {
			const element: PageElement | undefined = currentPage.getElementById(this.elementId);
			if (!element) {
				return false;
			}
			this.element = element;
		}

		return true;
	}

	/**
	 * @inheritDoc
	 */
	public execute(): boolean {
		if (!this.ensurePageAndElement()) {
			return false;
		}

		const page = this.element.getPage();
		if (page) {
			page.getProject().touch();
			Store.getInstance().setSelectedElement(this.element);
		}

		return true;
	}

	/**
	 * @inheritDoc
	 */
	public maybeMergeWith(previousCommand: Command): boolean {
		if (previousCommand.getType() !== this.getType()) {
			return false;
		}

		const previousElementCommand: ElementCommand = previousCommand as ElementCommand;
		if (previousElementCommand.elementId !== this.elementId) {
			return false;
		}

		return true;
	}

	/**
	 * @inheritDoc
	 */
	public undo(): boolean {
		if (!this.ensurePageAndElement()) {
			return false;
		}

		if (this.element.getPage()) {
			Store.getInstance().setSelectedElement(this.element);
		}

		return true;
	}
}
