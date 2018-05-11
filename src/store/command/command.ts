import { PageElement } from '../page-element';

/**
 * A user operation on a page or project, with the ability to undo and redo.
 * @see Store.execute()
 * @see Store.undo()
 * @see Store.redo()
 */
export abstract class Command {
	/**
	 * Performs this user operation (forward execute or redo).
	 * @return Whether the execution was successful.
	 * Returning false will drop the undo and redo buffers, as the state is unknown then.
	 */
	public abstract execute(): boolean;

	/**
	 * Returns the ID of a given element, if it is already part of a page.
	 * Can be used to memorize a reference instead of the actual element,
	 * so that the command does not break when pages are closed and opened.
	 * @param element The element to analyze. May be undefined.
	 * @return The ID or undefined, if the element is not set or not part of a page.
	 */
	protected getElementIdIfPartOfPage(element?: PageElement): string | undefined {
		return element && element.getPage() ? element.getId() : undefined;
	}

	/**
	 * Returns the type of this user command (a string derived from the class name).
	 * This can be used to determine whether a user command can combine with a previous one,
	 * to reduce similar undo steps.
	 */
	public abstract getType(): string;

	/**
	 * Looks at a given previous command, checking whether the types are compatible
	 * and the changes are too similar to keep both. If so, the method incorporates both changes
	 * into this command and returns true, indicating to remove the older command from the stack
	 * and only keep this one.
	 * @param previousCommand The previous command.
	 * @return Whether the method has merged itself into the previous command.
	 * <code>false</code> keeps both methods separate.
	 */
	public maybeMergeWith(previousCommand: Command): boolean {
		return false;
	}

	/**
	 * Reverts this user operation (undo).
	 * @return Whether the revert was successful.
	 * Returning false will drop the undo and redo buffers, as the state is unknown then.
	 */
	public abstract undo(): boolean;
}
