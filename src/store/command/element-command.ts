import { Command } from './command';
import { Page } from '../page/page';
import { PageElement } from '../page/page-element';
import { Store } from '../store';

/**
 * A user operation to add or remove a child to/from a parent, or to relocate it.
 */
export class ElementCommand extends Command {
	/**
	 * The element to change the parent of, or to remove.
	 */
	private child: PageElement;

	/**
	 * The ID of the element the user operation is performed on,
	 * if the element is already part of a page.
	 */
	private childId: string | undefined;

	/**
	 * The new position within the parent's children, if a parent is given.
	 * Leaving out this value puts the child to the end of the parent's children.
	 */
	private index?: number;

	/**
	 * The ID of the page the operation is performed on.
	 */
	private pageId: string;

	/**
	 * The new parent for the child. undefined removes the child.
	 */
	private parent?: PageElement;

	/**
	 * The ID ofg the target parent of the child element.
	 */
	private parentId?: string;

	/**
	 * The previous position, for undo.
	 */
	private previousIndex?: number;

	/**
	 * The previous parent, for undo.
	 */
	private previousParent?: PageElement;

	/**
	 * The ID of the previous parent, for undo.
	 */
	private previousParentId?: string | undefined;

	/**
	 * Creates a new user operation to add or remove a child to/from a parent, or to relocate it.
	 * @param child The element to change the parent of, or to remove.
	 * @param parent The new parent for the child. undefined removes the child.
	 * @param index The new position within the parent's children, if a parent is given.
	 * Leaving out this value puts the child to the end of the parent's children.
	 */
	public constructor(child: PageElement, parent?: PageElement, index?: number) {
		super();

		this.child = child;
		this.parent = parent;
		this.index = index;

		this.previousParent = child.getParent();
		this.previousIndex = this.previousParent ? child.getIndex() : undefined;

		// Memorize the page IDs.
		// This way, closing and opening a page does not break the command.

		const page = child.getPage();
		if (page) {
			this.pageId = page.getId();
		} else if (parent) {
			const parentPage = parent.getPage();
			// If the element is not known to the page, memorize the page ID from the target parent.
			if (parentPage) {
				this.pageId = parentPage.getId();
			}
		}

		if (!this.pageId) {
			throw new Error(
				'Element commands require either a child already added to a page, or a target parent for a new child'
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
	public static addChild(parent: PageElement, child: PageElement, index?: number): ElementCommand {
		return new ElementCommand(child, parent, index);
	}

	/**
	 * Creates a command to add a page element as another child of an element's parent,
	 * directly after that element. On execution, also removes the element from any previous parent.
	 * @param newSibling The element to add at a given location.
	 * @param location The element to add the new sibling after.
	 * @return The new element command. To register and run the command it, call Store.execute().
	 * @see Store.execute()
	 */
	public static addSibling(newSibling: PageElement, location: PageElement): ElementCommand {
		const parent: PageElement | undefined = location.getParent();
		return new ElementCommand(newSibling, parent, parent ? location.getIndex() + 1 : undefined);
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
		return new ElementCommand(element);
	}

	/**
	 * Creates a command to set a new parent for this element (and remove it
	 * from its previous parent). If no parent is provided, only removes it from its parent.
	 * @param child The element to set the new parent of.
	 * @param parent The (optional) new parent for the element.
	 * @param index The 0-based new position within the children of the new parent.
	 * Leaving out the position adds it at the end of the list.
	 * @return The new element command. To register and run the command it, call Store.execute().
	 * @see Store.execute()
	 */
	public static setParent(
		child: PageElement,
		parent: PageElement,
		index?: number
	): ElementCommand {
		return new ElementCommand(child, parent, index);
	}

	/**
	 * Ensures that the page of this command is currently open in the store, and opens it if not.
	 * Then ensures that the child element is used from that open page.
	 * @return Whether the operation was successful. On failure, the execute/undo should abort.
	 */
	protected ensurePageAndChild(): boolean {
		let currentPage: Page | undefined = Store.getInstance().getCurrentPage();
		if (!currentPage || currentPage.getId() !== this.pageId) {
			if (!Store.getInstance().openPage(this.pageId)) {
				return false;
			}
			currentPage = Store.getInstance().getCurrentPage() as Page;
		}

		if (this.childId) {
			const child: PageElement | undefined = currentPage.getElementById(this.childId);
			if (!child) {
				return false;
			}
			this.child = child;
		}

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
		if (!this.ensurePageAndChild()) {
			return false;
		}

		this.child.setParent(this.parent, this.index);
		this.memorizeElementIds();

		if (this.child.getPage()) {
			Store.getInstance().setSelectedElement(this.child);
		}

		return true;
	}

	/**
	 * @inheritDoc
	 */
	public getType(): string {
		return 'element-location';
	}

	/**
	 * Stores the ID of the page elements if they are currently added to the page,
	 * to prevent issues with undo/redo when pages are closed and reopened.
	 */
	private memorizeElementIds(): void {
		this.childId = this.getElementIdIfPartOfPage(this.child);
		this.parentId = this.getElementIdIfPartOfPage(this.parent);
		this.previousParentId = this.getElementIdIfPartOfPage(this.previousParent);
	}

	/**
	 * @inheritDoc
	 */
	public undo(): boolean {
		if (!this.ensurePageAndChild()) {
			return false;
		}

		this.child.setParent(this.previousParent, this.previousIndex);
		this.memorizeElementIds();

		if (this.child.getPage()) {
			Store.getInstance().setSelectedElement(this.child);
		}

		return true;
	}
}
