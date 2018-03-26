import { Command } from './command';
import { Page } from '../page/page';
import { PageElement } from '../page/page-element';
import { Store } from '../store';
import * as Uuid from 'uuid';

/**
 * A user operation to set the value of a page element property.
 */
export class PropertyValueCommand extends Command {
	/**
	 * The element the user operation is performed on.
	 */
	private element: PageElement;

	/**
	 * The ID of the element the user operation is performed on,
	 * if the element is already part of a page.
	 */
	private elementId: string;

	private id: string;
	/**
	 * The ID of the page the operation is performed on.
	 */
	private pageId: string;

	/**
	 * A dot ('.') separated optional path within an object property to point to a deep
	 * property. E.g., setting propertyId to 'image' and path to 'src.srcSet.xs',
	 * the operation edits 'image.src.srcSet.xs' on the element.
	 */
	private path?: string;

	/**
	 * The previous value, for undo.
	 */
	// tslint:disable-next-line:no-any
	private previousValue: any;

	/**
	 * The ID of the property to modify.
	 */
	private propertyId: string;

	/**
	 * Whether this property value editing is complete now, so that similar value changes do not
	 * merge with this one. If you edit the text of a page element property, all subsequent edits
	 * on this property automatically merge. After leaving the input, setting this property to true
	 * will cause the next text editing on this property to stay a separate undo command.
	 */
	protected sealed: boolean = false;

	// tslint:disable-next-line:no-any
	private value: any;

	/**
	 * Creates a new user operation to set the value of a page element property.
	 * @param element The element to change a property value of.
	 * @param propertyId The ID of the property to change.
	 * @param value The new value for the property.
	 * @param path A dot ('.') separated optional path within an object property to point to a deep
	 * property. E.g., setting propertyId to 'image' and path to 'src.srcSet.xs',
	 * the operation edits 'image.src.srcSet.xs' on the element.
	 */
	// tslint:disable-next-line:no-any
	public constructor(element: PageElement, propertyId: string, value: any, path?: string) {
		super();
		this.id = Uuid.v4();

		this.element = element;
		this.propertyId = propertyId;
		this.value = value;
		this.path = path;
		this.previousValue = element.getPropertyValue(propertyId, path);

		// Memorize the element and page IDs.
		// This way, closing and opening a page does not break the command.

		this.elementId = element.getId();
		const page = element.getPage();
		if (page) {
			this.pageId = page.getId();
		} else {
			throw new Error(
				'Property value commands require that the element is already added to a page'
			);
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

		this.element.setPropertyValue(this.propertyId, this.value, this.path);

		if (this.element.getPage()) {
			Store.getInstance().setSelectedElement(this.element);
		}

		return true;
	}

	/**
	 * @inheritDoc
	 */
	public getType(): string {
		return 'set-property-value';
	}

	/**
	 * @inheritDoc
	 */
	public maybeMergeWith(previousCommand: Command): boolean {
		if (previousCommand.getType() !== this.getType()) {
			return false;
		}

		const previousPropertyCommand: PropertyValueCommand = previousCommand as PropertyValueCommand;
		console.log(`Comparing new command ${this.id} against ${previousPropertyCommand.id}`);
		if (
			previousPropertyCommand.sealed ||
			previousPropertyCommand.element.getId() !== this.element.getId() ||
			previousPropertyCommand.propertyId !== this.propertyId ||
			previousPropertyCommand.path !== this.path
		) {
			return false;
		}

		this.previousValue = previousPropertyCommand.previousValue;
		return true;
	}

	/**
	 * Marks that this property value editing is complete now, so that similar value changes do not
	 * merge with this one. If you edit the text of a page element property, all subsequent edits
	 * on this property automatically merge. After leaving the input, sealing will cause the next
	 * text editing on this property to stay a separate undo command.
	 */
	public seal(): void {
		this.sealed = true;
		console.log(`Sealed ${this.id}`);
	}

	/**
	 * @inheritDoc
	 */
	public undo(): boolean {
		if (!this.ensurePageAndElement()) {
			return false;
		}

		this.element.setPropertyValue(this.propertyId, this.previousValue, this.path);

		if (this.element.getPage()) {
			Store.getInstance().setSelectedElement(this.element);
		}

		return true;
	}
}
