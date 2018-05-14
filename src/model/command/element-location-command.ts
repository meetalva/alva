import { Command } from './command';
import { Element, ElementContent } from '../element';
import { ElementCommand } from './element-command';
import { Page } from '../page/page';
import { ViewStore } from '../../store'; // TODO: Remove dependency on store

/**
 * A user operation to add or remove a child to/from a parent, or to relocate it.
 */
export class ElementLocationCommand extends ElementCommand {
	/**
	 * The new position within the parent's children, if a parent is given.
	 * Leaving out this value puts the child to the end of the parent's children.
	 */
	protected index: number = 0;

	/**
	 * The new parent for the child. undefined removes the child.
	 */
	protected parent: Element;

	/**
	 * The ID ofg the target parent of the child element.
	 */
	protected parentId?: string;

	/**
	 * The previous position, for undo.
	 */
	protected previousIndex: number;

	/**
	 * The previous parent, for undo.
	 */
	protected previousParent?: Element;

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
	protected slotId: string;

	public constructor(init: { element: Element; index: number; parent: Element; slotId: string }) {
		super(init.element);

		this.parent = init.parent;
		this.slotId = init.slotId;
		this.index = init.index;

		const container = init.element.getContainer();

		this.previousParent = init.element.getParent();
		this.previousSlotId = container ? container.getSlotId() : undefined;
		this.previousIndex = this.previousParent ? (init.element.getIndex() as number) : 0;

		const parentPage = init.parent.getPage();

		if (!parentPage) {
			return;
		}

		this.pageId = parentPage.getId();
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
	public static addChild(init: {
		child: Element;
		index: number;
		parent: Element;
		slotId: string;
	}): ElementCommand {
		return new ElementLocationCommand({
			element: init.child,
			parent: init.parent,
			slotId: init.slotId,
			index: init.index
		});
	}

	public static addSibling(init: { newSibling: Element; sibling: Element }): ElementCommand {
		const parent = init.sibling.getParent() as Element;
		const container = init.sibling.getContainer() as ElementContent;

		return new ElementLocationCommand({
			element: init.newSibling,
			parent,
			slotId: container.getSlotId(),
			index: parent ? (init.sibling.getIndex() as number) + 1 : 0
		});
	}

	public static setParent(
		child: Element,
		parent: Element,
		slotId: string,
		index: number
	): ElementCommand {
		return new ElementLocationCommand({
			element: child,
			parent,
			slotId,
			index
		});
	}

	/**
	 * @inheritDoc
	 */
	protected ensurePageAndElement(): boolean {
		super.ensurePageAndElement();

		const currentPage: Page | undefined = ViewStore.getInstance().getCurrentPage() as Page;
		if (this.parentId) {
			const parent: Element | undefined = currentPage.getElementById(this.parentId);
			if (!parent) {
				return false;
			}
			this.parent = parent;
		}

		if (this.previousParentId) {
			const previousParent: Element | undefined = currentPage.getElementById(
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

		// Do not try to add an element to itself
		// or one of its children
		if (this.element.isAncestorOf(this.parent)) {
			return false;
		}

		this.element.setParent({
			parent: this.parent,
			slotId: this.slotId,
			index: this.index
		});

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

		// Remove element from page
		if (
			typeof this.previousParent === 'undefined' ||
			typeof this.previousSlotId === 'undefined' ||
			typeof this.previousIndex === 'undefined'
		) {
			this.element.remove();
			this.memorizeElementIds();
			return true;
		}

		// Move element on page
		this.element.setParent({
			parent: this.previousParent,
			slotId: this.previousSlotId,
			index: this.previousIndex
		});

		this.memorizeElementIds();

		return true;
	}
}
