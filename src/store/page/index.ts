import * as fs from 'fs';
import { PageElement } from './page_element';
import * as path from 'path';
import { Store } from '..';

export class Page {
	public name: string;
	public pageId: string;
	public projectId: string;
	public root?: PageElement;
	public store: Store;

	public constructor(store: Store, projectId: string, pageId: string) {
		this.store = store;
		this.projectId = projectId;
		this.pageId = pageId;
		this.name = 'New page';

		this.load();
	}

	public load(): void {
		const projectPath: string = path.join(this.store.getProjectsPath(), this.projectId);
		const pagePath: string = path.join(projectPath, this.pageId + '.json');

		// tslint:disable-next-line:no-any
		const pageModel: any = JSON.parse(fs.readFileSync(pagePath, 'utf8'));

		this.name = pageModel.name;
		this.root = pageModel.root;
	}
}
