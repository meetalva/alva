import { Command } from './command';
import { ElementCommand } from './element-command';
import { Page } from '../page/page';
import { PageElement } from '../page/page-element';
import { Store } from '../store';

/**
 * A user operation to add or remove a child to/from a parent, or to relocate it.
 */
export class ElementLocationCommand extends ElementCommand {
	/**
	 * The new position within the parent's children, if a parent is given.
	 * Leaving out this value puts the child to the end of the parent's children.
	 */
	protected index?: number;

	/**
	 * The new parent for the child. undefined removes the child.
	 */
	protected parent?: PageElement;

	/**
	 * The ID ofg the target parent of the child element.
	 */
	protected parentId?: string;

	/**
	 * The previous position, for undo.
	 */
	protected previousIndex?: number;

	/**
	 * The previous parent, for undo.
	 */
	protected previousParent?: PageElement;

	/**
	 * The ID of the previous parent, for undo.
	 */
	protected previousParentId?: string | undefined;

	/**
	 * The slot the element was attached to at creation time of the command. undefined means default slot.
	 */
	protected previousSlotId?: string;

	/**
	 * The slot the element is attached to. undefined means default slot.
	 */
	protected slotId?: string;

	/**
	 * Creates a new user operation to add or remove a child to/from a parent, or to relocate it.
	 * @param element The element the user operation is performed on.
	 * @param parent The new parent for the child. undefined removes the child.
	 * @param index The new position within the parent's children, if a parent is given.
	 * @param slotId The slot to attach the element to. When undefined the default slot is used.
	 * Leaving out this value puts the child to the end of the parent's children.
	 */
	public constructor(element: PageElement, parent?: PageElement, slotId?: string, index?: number) {
		super(element);

		this.parent = parent;
		this.slotId = slotId;
		this.index = index;

		this.previousParent = element.getParent();
		this.previousSlotId = element.getParentSlotId();
		this.previousIndex = this.previousParent ? element.getIndex() : undefined;

		// Memorize the page IDs of the new parent, if the element has no parent.
		// This way, closing and opening a page does not break the command.

		if (!this.pageId && parent) {
			const parentPage = parent.getPage();
			// If the element is not known to the page, memorize the page ID from the target parent.
			if (parentPage) {
				this.pageId = parentPage.getId();
			}
		}

		if (!this.pageId) {
			throw new Error(
				'Element location commands require either a child already added to a page,' +
					' or a target parent for a new child'
			);
		}
	}

	/**
	 * Creates a command to add a child element to a given parent element
	 * (and remove it from any other parent).
	 * @param parent The parent to add the child to.
	 * @param child The child element to add.
	 * @param index The 0-based new position within the parent's children.
	 * Leaving out the position adds it at the end of the list.
	 * @return The new element command. To register and run the command it, call Store.execute().
	 * @see Store.execute()
	 */
	public static addChild(
		parent: PageElement,
		child: PageElement,
		slotId?: string,
		index?: number
	): ElementCommand {
		return new ElementLocationCommand(child, parent, slotId, index);
	}

	/**
	 * Creates a command to add a page element as another child of an element's parent,
	 * directly after that element. On execution, also removes the element from any previous parent.
	 * @param newSibling The element to add at a given location.
	 * @param location The element to add the new sibling after.
	 * @param slotId The slot to attach the element to. When undefined the default slot is used.
	 * @return The new element command. To register and run the command it, call Store.execute().
	 * @see Store.execute()
	 */
	public static addSibling(newSibling: PageElement, location: PageElement): ElementCommand {
		const parent: PageElement | undefined = location.getParent();
		return new ElementLocationCommand(
			newSibling,
			parent,
			location.getParentSlotId(),
			parent ? location.getIndex() + 1 : undefined
		);
	}

	/**
	 * Creates a command to remove a page element from its parent.
	 * You may later re-add it using a command created with addChild() or setParent().
	 * @param element The element to remove from its parent.
	 * @return The new element command. To register and run the command it, call Store.execute().
	 * @see addChild()
	 * @see setParent()
	 * @see Store.execute()
	 */
	public static remove(element: PageElement): ElementCommand {
		return new ElementLocationCommand(element);
	}

	/**
	 * Creates a command to set a new parent for this element (and remove it
	 * from its previous parent). If no parent is provided, only removes it from its parent.
	 * @param child The element to set the new parent of.
	 * @param parent The (optional) new parent for the element.
	 * @param slotId The slot to attach the element to. When undefined the default slot is used.
	 * @param index The 0-based new position within the children of the new parent.
	 * Leaving out the position adds it at the end of the list.
	 * @return The new element command. To register and run the command it, call Store.execute().
	 * @see Store.execute()
	 */
	public static setParent(
		child: PageElement,
		parent: PageElement,
		slotId?: string,
		index?: number
	): ElementCommand {
		return new ElementLocationCommand(child, parent, slotId, index);
	}

	/**
	 * @inheritDoc
	 */
	protected ensurePageAndElement(): boolean {
		super.ensurePageAndElement();

		const currentPage: Page | undefined = Store.getInstance().getCurrentPage() as Page;
		if (this.parentId) {
			const parent: PageElement | undefined = currentPage.getElementById(this.parentId);
			if (!parent) {
				return false;
			}
			this.parent = parent;
		}

		if (this.previousParentId) {
			const previousParent: PageElement | undefined = currentPage.getElementById(
				this.previousParentId
			);
			if (!previousParent) {
				return false;
			}
			this.previousParent = previousParent;
		}

		return true;
	}

	/**
	 * @inheritDoc
	 */
	public execute(): boolean {
		if (!super.execute()) {
			return false;
		}

		this.element.setParent(this.parent, this.slotId, this.index);
		this.memorizeElementIds();

		return true;
	}

	/**
	 * @inheritDoc
	 */
	public getType(): string {
		return 'element-location';
	}

	/**
	 * @inheritDoc
	 */
	public maybeMergeWith(previousCommand: Command): boolean {
		return false;
	}

	/**
	 * Stores the ID of the page elements if they are currently added to the page,
	 * to prevent issues with undo/redo when pages are closed and reopened.
	 */
	private memorizeElementIds(): void {
		this.parentId = this.getElementIdIfPartOfPage(this.parent);
		this.previousParentId = this.getElementIdIfPartOfPage(this.previousParent);
	}

	/**
	 * @inheritDoc
	 */
	public undo(): boolean {
		if (!super.undo()) {
			return false;
		}

		this.element.setParent(this.previousParent, this.previousSlotId, this.previousIndex);
		this.memorizeElementIds();

		return true;
	}
}
