import { Command } from './command';
import { ElementCommand } from './element-command';
import { PageElement } from '../page/page-element';

/**
 * A user operation to set the value of a page element property.
 */
export class PropertyValueCommand extends ElementCommand {
	/**
	 * A dot ('.') separated optional path within an object property to point to a deep
	 * property. E.g., setting propertyId to 'image' and path to 'src.srcSet.xs',
	 * the operation edits 'image.src.srcSet.xs' on the element.
	 */
	protected path?: string;

	/**
	 * The previous value, for undo.
	 */
	// tslint:disable-next-line:no-any
	protected previousValue: any;

	/**
	 * The ID of the property to modify.
	 */
	protected propertyId: string;

	/**
	 * Whether this property value editing is complete now, so that similar value changes do not
	 * merge with this one. If you edit the text of a page element property, all subsequent edits
	 * on this property automatically merge. After leaving the input, setting this property to true
	 * will cause the next text editing on this property to stay a separate undo command.
	 */
	protected sealed: boolean = false;

	// tslint:disable-next-line:no-any
	protected value: any;

	/**
	 * Creates a new user operation to set the value of a page element property.
	 * @param element The element the user operation is performed on.
	 * @param propertyId The ID of the property to change.
	 * @param value The new value for the property.
	 * @param path A dot ('.') separated optional path within an object property to point to a deep
	 * property. E.g., setting propertyId to 'image' and path to 'src.srcSet.xs',
	 * the operation edits 'image.src.srcSet.xs' on the element.
	 */
	// tslint:disable-next-line:no-any
	public constructor(element: PageElement, propertyId: string, value: any, path?: string) {
		super(element);

		this.propertyId = propertyId;
		this.value = value;
		this.path = path;
		this.previousValue = element.getPropertyValue(propertyId, path);

		if (!this.pageId) {
			throw new Error(
				'Property value commands require that the element is already added to a page'
			);
		}
	}

	/**
	 * @inheritDoc
	 */
	public execute(): boolean {
		if (!super.execute()) {
			return false;
		}

		this.element.setPropertyValue(this.propertyId, this.value, this.path);

		return true;
	}

	/**
	 * @inheritDoc
	 */
	public getType(): string {
		return 'property-value';
	}

	/**
	 * @inheritDoc
	 */
	public maybeMergeWith(previousCommand: Command): boolean {
		if (!super.maybeMergeWith(previousCommand)) {
			return false;
		}

		const previousPropertyCommand: PropertyValueCommand = previousCommand as PropertyValueCommand;
		if (
			previousPropertyCommand.sealed ||
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
	}

	/**
	 * @inheritDoc
	 */
	public undo(): boolean {
		if (!super.undo()) {
			return false;
		}

		this.element.setPropertyValue(this.propertyId, this.previousValue, this.path);

		return true;
	}
}
