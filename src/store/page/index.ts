import { JsonObject, Persister } from '../json';
import { PageElement } from './page_element';
import * as PathUtils from 'path';
import { Store } from '..';

export class Page {
	private name: string;
	private id: string;
	private root?: PageElement;
	private store: Store;

	public constructor(id: string, store: Store) {
		this.id = id;
		this.store = store;
		this.name = 'New Page';
	}

	public static fromJsonObject(json: JsonObject, id: string, store: Store): Page {
		const page = new Page(id, store);
		page.name = json.name as string;
		page.root = PageElement.fromJsonObject(json.root as JsonObject, store);

		return page;
	}

	public getName(): string {
		return this.name;
	}

	public getId(): string {
		return this.id;
	}

	public getRoot(): PageElement {
		return this.root as PageElement;
	}

	public save(): void {
		const pagePath: string = PathUtils.join(this.store.getPagesPath(), `page-${this.id}.yaml`);
		const jsonObject: JsonObject = this.toJsonObject();
		Persister.saveYaml(pagePath, jsonObject);
	}

	public toJsonObject(): JsonObject {
		return { name: this.name, root: this.root ? this.root.toJsonObject() : undefined };
	}
}
