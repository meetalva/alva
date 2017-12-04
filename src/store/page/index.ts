import * as FileUtils from 'fs';
import { PageElement } from './page_element';
import * as PathUtils from 'path';
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
		const projectPath: string = PathUtils.join(this.store.getProjectsPath(), this.projectId);
		const pagePath: string = PathUtils.join(projectPath, this.pageId + '.json');

		// tslint:disable-next-line:no-any
		const pageModel: any = JSON.parse(FileUtils.readFileSync(pagePath, 'utf8'));

		this.name = pageModel.name;
		this.root = pageModel.root;
	}
}
