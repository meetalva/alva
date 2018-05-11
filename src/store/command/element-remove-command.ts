import { Command } from './command';
import { ElementCommand } from './element-command';
import { Page } from '../page/page';
import { PageElement } from '../page-element';
import { ViewStore } from '../view-store';

/**
 * A user operation to add or remove a child to/from a parent, or to relocate it.
 */
export class ElementRemoveCommand extends ElementCommand {
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
	 * The slot the element is attached to. undefined means default slot.
	 */
	protected slotId?: string = 'default';

	public constructor(init: { element: PageElement }) {
		super(init.element);

		const page = this.element.getPage();
		const parent = this.element.getParent();

		if (!page || !parent) {
			return;
		}

		this.parent = parent;
		this.parentId = parent.getId();
		this.slotId = this.element.getContainerId();
		this.index = this.element.getIndex();
		this.pageId = page.getId();
	}

	/**
	 * @inheritDoc
	 */
	protected ensurePageAndElement(): boolean {
		super.ensurePageAndElement();

		const currentPage: Page | undefined = ViewStore.getInstance().getCurrentPage() as Page;
		if (this.parentId) {
			const parent: PageElement | undefined = currentPage.getElementById(this.parentId);
			if (!parent) {
				return false;
			}
			this.parent = parent;
		}

		if (this.parentId) {
			const parent: PageElement | undefined = currentPage.getElementById(this.parentId);
			if (!parent) {
				return false;
			}
			this.parent = parent;
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

		this.element.remove();

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
	 * @inheritDoc
	 */
	public undo(): boolean {
		if (!super.undo()) {
			return false;
		}

		return true;
	}
}
