import { JsonArray, JsonObject } from '../json';
import * as MobX from 'mobx';
import { PageRef } from './page_ref';
import { Store } from '../store';

export class Project {
	@MobX.observable private id: string;
	@MobX.observable private name: string;
	@MobX.observable private pages: PageRef[] = [];

	public constructor(id: string, name: string) {
		this.id = id;
		this.name = name;
	}

	public static fromJsonObject(json: JsonObject, store: Store): Project {
		const project: Project = new Project(json.id as string, json.name as string);

		const pages: PageRef[] = [];
		(json.pages as JsonArray).forEach((pageJson: JsonObject) => {
			pages.push(PageRef.fromJsonObject(pageJson, project));
		});

		return project;
	}

	public getId(): string {
		return this.id;
	}

	public getName(): string {
		return this.name;
	}

	public getPages(): PageRef[] {
		return this.pages;
	}

	public getPagesInternal(): MobX.IObservableArray<PageRef> {
		return this.pages as MobX.IObservableArray<PageRef>;
	}

	public toJsonObject(): JsonObject {
		const pagesJsonObject: JsonObject[] = [];
		this.pages.forEach(pageRef => {
			pagesJsonObject.push(pageRef.toJsonObject());
		});

		return {
			id: this.id,
			name: this.name,
			pages: pagesJsonObject
		};
	}
}
