import * as fs from 'fs';
import PageElement from './page_element';
import * as path from 'path';
import Store from '..';

export default class Page {
	name: string;
	pageId: string;
	projectId: string;
	root/* TODO: Does not compile: ?*/: PageElement;
	store: Store;

	constructor(store: Store, projectId: string, pageId: string) {
		this.store = store;
		this.projectId = projectId;
		this.pageId = pageId;
		this.name = 'New page';

		this.load();
	}

	load() {
		const projectPath: string = path.join(this.store.getProjectsPath(), this.projectId);
		const pagePath: string = path.join(projectPath, this.pageId + ".json");
		const pageModel: any = JSON.parse(fs.readFileSync(pagePath, 'utf8'));
		this.name = pageModel.name;
		this.root = pageModel.root;
	}
}
