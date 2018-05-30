import { Command } from './command';
import { ElementCommand } from './element-command';
import { Element, ElementContent, Page } from '../model';
import { ViewStore } from '../store';

export class ElementRemoveCommand extends ElementCommand {
	protected container: ElementContent;
	protected index: number;
	protected page: Page;

	public constructor(init: { element: Element; store: ViewStore }) {
		super(init.element, init.store);

		this.container = this.element.getContainer() as ElementContent;
		this.index = this.element.getIndex();
		this.page = this.element.getPage() as Page;
	}

	/**
	 * @inheritDoc
	 */
	protected ensurePageAndElement(): boolean {
		return super.ensurePageAndElement();
	}

	/**
	 * @inheritDoc
	 */
	public execute(): boolean {
		if (!super.execute()) {
			return false;
		}

		this.container.remove({ element: this.element });

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

		this.container.insert({
			element: this.element,
			at: this.index
		});

		this.store.setSelectedElement(this.element);

		return true;
	}
}
