import { Command } from './command';
import { Page } from '../page';
import { Project } from '../project';
import { ViewStore } from '../../store'; // TODO: Remove dependency on store
import * as Types from '../types';

export class PageRemoveCommand extends Command {
	private page: Page;
	private project: Project;

	private constructor(init: { page: Page; project: Project }) {
		super();
		this.page = init.page;
		this.project = init.project;
	}

	public static create(init: { page: Page; project: Project }): PageRemoveCommand {
		return new PageRemoveCommand(init);
	}

	public execute(): boolean {
		const store = ViewStore.getInstance();
		const index = this.project.getPageIndex(this.page);

		if (index === 0) {
			store.unsetActivePage();
			store.setActiveView(Types.AlvaView.Pages);
		} else {
			store.setActivePageByIndex(index - 1);
		}

		this.project.removePage(this.page);
		return true;
	}

	public getType(): string {
		return 'page-remove';
	}

	public undo(): boolean {
		const store = ViewStore.getInstance();

		this.project.addPage(this.page);
		store.setActivePage(this.page);
		return true;
	}
}
