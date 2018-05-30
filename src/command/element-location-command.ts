import { Command } from './command';
import { ElementCommand } from './element-command';
import { Element, Project } from '../model';
import { ViewStore } from '../store';

/**
 * A user operation to add or remove a child to/from a parent, or to relocate it.
 */
export class ElementLocationCommand extends ElementCommand {
	protected contentId: string;
	protected index: number = 0;
	// protected parentId?: string;
	// protected previousIndex: number;
	// protected previousParentId?: string | undefined;
	// protected previousSlotId?: string;
	// protected slotId: string;
	protected previousContentId: string;
	protected previousIndex: number;

	public constructor(init: {
		contentId: string;
		elementId: string;
		index: number;
		store: ViewStore;
	}) {
		super(
			(init.store.getProject() as Project).getElementById(init.elementId) as Element,
			init.store
		);
		this.index = init.index;
		this.contentId = init.contentId;
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
		childId: string;
		contentId: string;
		index: number;
		store: ViewStore;
	}): ElementCommand {
		return new ElementLocationCommand({
			elementId: init.childId,
			contentId: init.contentId,
			index: init.index,
			store: init.store
		});
	}

	public static setParent(
		childId: string,
		contentId: string,
		index: number,
		store: ViewStore
	): ElementCommand {
		return new ElementLocationCommand({
			elementId: childId,
			contentId,
			index,
			store
		});
	}

	/**
	 * @inheritDoc
	 */
	public execute(): boolean {
		if (!super.execute()) {
			return false;
		}

		const project = this.store.getProject();

		if (!project || !this.contentId) {
			return false;
		}

		const container = project.getElementContentById(this.contentId);

		if (!container) {
			return false;
		}

		const previousContainer = this.element.getContainer();

		if (previousContainer) {
			this.previousIndex = previousContainer.getElementIndexById(this.element.getId());
			this.previousContentId = previousContainer.getId();
			previousContainer.remove({ element: this.element });
		}

		container.insert({ element: this.element, at: this.index });
		this.element.setContainer(container);

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

		const project = this.store.getProject();

		if (!project) {
			return false;
		}

		// Previously not on page, remove
		if (
			typeof this.previousContentId === 'undefined' ||
			typeof this.previousIndex === 'undefined'
		) {
			this.element.remove();
		}

		// Move to previous position
		const previousContainer = project.getElementContentById(this.previousContentId);

		if (previousContainer) {
			const currentContainer = this.element.getContainer();

			if (currentContainer) {
				currentContainer.remove({ element: this.element });
			}

			previousContainer.insert({ element: this.element, at: this.previousIndex });
			this.element.setContainer(previousContainer);
		}

		return true;
	}
}
