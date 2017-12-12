import * as FileUtils from 'fs';
import { JsonObject } from '../json';
import { PageElement } from './page_element';
import * as PathUtils from 'path';
import { Store } from '..';

export class Page {
	private name: string;
	private pageId: string;
	private projectId: string;
	private root?: PageElement;
	private store: Store;

	public constructor(projectId: string, pageId: string, store: Store) {
		this.pageId = pageId;
		this.projectId = projectId;
		this.store = store;
		this.name = 'New Page';
	}

	public static fromJsonObject(
		json: JsonObject,
		projectId: string,
		pageId: string,
		store: Store
	): Page {
		const page = new Page(projectId, pageId, store);
		page.name = json.name as string;
		page.root = PageElement.fromJsonObject(json.root as JsonObject, store);

		return page;
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

	public save(): void {
		const projectPath: string = PathUtils.join(this.store.getProjectsPath(), this.projectId);
		const pagePath: string = PathUtils.join(projectPath, this.pageId + '.json');
		const json: JsonObject = this.toJsonObject();
		FileUtils.writeFileSync(pagePath, JSON.stringify(json), 'utf8');
	}

	public toJsonObject(): JsonObject {
		return { name: this.name, root: this.root ? this.root.toJsonObject() : undefined };
	}
}
