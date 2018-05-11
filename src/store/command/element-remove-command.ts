import { Command } from './command';
import { ElementCommand } from './element-command';
import { Page } from '../page/page';
import { PageElement, PageElementContent } from '../page-element';
import { ViewStore } from '../view-store';

export class ElementRemoveCommand extends ElementCommand {
	protected container: PageElementContent;
	protected index: number;
	protected page: Page;

	public constructor(init: { element: PageElement }) {
		super(init.element);

		this.container = this.element.getContainer() as PageElementContent;
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

		const store = ViewStore.getInstance();

		this.container.insert({
			element: this.element,
			at: this.index
		});

		store.setSelectedElement(this.element);

		return true;
	}
}
