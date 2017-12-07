import * as MobX from 'mobx';
import { PageRef } from '../page/page_ref';

export class Project {
	@MobX.observable private id: string;
	@MobX.observable private name: string;
	@MobX.observable private pages: PageRef[] = [];

	public constructor(id: string, name: string, pages: PageRef[]) {
		this.id = id;
		this.name = name;
		this.pages = pages;
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
}
