import { Command } from './command';
import { Page, Project } from '../model';
import { ViewStore } from '../store';
import * as Types from '../model/types';

export class PageRemoveCommand extends Command {
	private page: Page;
	private project: Project;
	private store: ViewStore;

	private constructor(init: { page: Page; project: Project; store: ViewStore }) {
		super();
		this.page = init.page;
		this.project = init.project;
		this.store = init.store;
	}

	public static create(init: {
		page: Page;
		project: Project;
		store: ViewStore;
	}): PageRemoveCommand {
		return new PageRemoveCommand(init);
	}

	public execute(): boolean {
		const index = this.project.getPageIndex(this.page);

		if (index === 0) {
			this.store.unsetActivePage();
			this.store.setActiveView(Types.AlvaView.Pages);
		} else {
			this.store.setActivePageByIndex(index - 1);
		}

		this.project.removePage(this.page);
		return true;
	}

	public getType(): string {
		return 'page-remove';
	}

	public undo(): boolean {
		this.project.addPage(this.page);
		this.store.setActivePage(this.page);
		return true;
	}
}
