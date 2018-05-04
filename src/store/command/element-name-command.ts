import { Command } from './command';
import { ElementCommand } from './element-command';
import { PageElement } from '../page/page-element';

/**
 * A user operation to set the name of a page element.
 */
export class ElementNameCommand extends ElementCommand {
	/**
	 * The new name for the page element.
	 */
	private name: string;

	/**
	 * The previous value, for undo.
	 */
	private previousName: string;

	/**
	 * Creates a new user operation to set the name of a page element.
	 * @param element The element the user operation is performed on.
	 * @param name The new name for the page element.
	 */
	// tslint:disable-next-line:no-any
	public constructor(element: PageElement, name: string) {
		super(element);

		this.name = name.length === 0 ? element.getName({ unedited: true }) : name;
		this.previousName = element.getName({ unedited: true });

		if (!this.pageId) {
			throw new Error(
				'Element name commands require that the element is already added to a page'
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

		this.element.setName(this.name);
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public getType(): string {
		return 'element-name';
	}

	/**
	 * @inheritDoc
	 */
	public maybeMergeWith(previousCommand: Command): boolean {
		if (!super.maybeMergeWith(previousCommand)) {
			return false;
		}

		const previousElementCommand = previousCommand as ElementNameCommand;

		this.previousName = previousElementCommand.previousName;
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public undo(): boolean {
		if (!super.undo()) {
			return false;
		}

		this.element.setName(this.previousName);
		return true;
	}
}
