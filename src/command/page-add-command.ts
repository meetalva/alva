import { Command } from './command';
import { Page, Project } from '../model';
import { ViewStore } from '../store';
import * as Types from '../model/types';

export class PageAddCommand extends Command {
	private page: Page;
	private project: Project;
	private store: ViewStore;

	private constructor(init: { page: Page; project: Project; store: ViewStore }) {
		super();
		this.page = init.page;
		this.project = init.project;
		this.store = init.store;
	}

	public static create(init: { page: Page; project: Project; store: ViewStore }): PageAddCommand {
		return new PageAddCommand(init);
	}

	public execute(): boolean {
		this.project.addPage(this.page);
		this.store.setActivePage(this.page);
		return true;
	}

	public getType(): string {
		return 'page-create';
	}

	public undo(): boolean {
		const index = this.project.getPageIndex(this.page);

		if (index === 0) {
			this.store.unsetActivePage();
			this.store.setActiveView(Types.AlvaView.Pages);
		} else {
			this.store.setActivePageByIndex(index - 1);
		}

		return this.project.removePage(this.page);
	}
}
