import * as FileUtils from 'fs';
import { PageElement } from './page_element';
import * as PathUtils from 'path';
import { Store } from '..';

export class Page {
	private name: string;
	private pageId: string;
	private projectId: string;
	private root?: PageElement;
	private store: Store;

	public constructor(store: Store, projectId: string, pageId: string) {
		this.store = store;
		this.projectId = projectId;
		this.pageId = pageId;
		this.name = 'New page';

		this.reload();
	}

	public getName(): string {
		return this.name;
	}

	public getPageId(): string {
		return this.pageId;
	}

	public getProjectId(): string {
		return this.projectId;
	}

	public getRoot(): PageElement {
		return this.root as PageElement;
	}

	public reload(): void {
		const projectPath: string = PathUtils.join(this.store.getProjectsPath(), this.projectId);
		const pagePath: string = PathUtils.join(projectPath, this.pageId + '.json');

		// tslint:disable-next-line:no-any
		const pageModel: any = JSON.parse(FileUtils.readFileSync(pagePath, 'utf8'));

		this.name = pageModel.name;
		this.root = new PageElement(this.store, pageModel.root);
	}
}
