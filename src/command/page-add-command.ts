import { Command } from './command';
import { Page, Project } from '../model';
import { ViewStore } from '../store';
import * as Types from '../model/types';

export class PageAddCommand extends Command {
	private page: Page;
	private project: Project;

	private constructor(init: { page: Page; project: Project }) {
		super();
		this.page = init.page;
		this.project = init.project;
	}

	public static create(init: { page: Page; project: Project }): PageAddCommand {
		return new PageAddCommand(init);
	}

	public execute(): boolean {
		const store = ViewStore.getInstance();

		this.project.addPage(this.page);
		store.setActivePage(this.page);
		return true;
	}

	public getType(): string {
		return 'page-create';
	}

	public undo(): boolean {
		const store = ViewStore.getInstance();
		const index = this.project.getPageIndex(this.page);

		if (index === 0) {
			store.unsetActivePage();
			store.setActiveView(Types.AlvaView.Pages);
		} else {
			store.setActivePageByIndex(index - 1);
		}

		return this.project.removePage(this.page);
	}
}
