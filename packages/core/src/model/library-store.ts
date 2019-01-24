import * as Mobx from 'mobx';
import * as _ from 'lodash';
import { Project } from './project';
import { LibraryStoreItem } from './library-store-item';

export interface LibraryStoreInit {
	project?: Project;
}

export class LibraryStore {
	private readonly recommended = [
		{
			name: '@meetalva/designkit',
			version: 'latest'
		},
		{
			name: '@material-ui/core',
			version: '3.9.0'
		}
	];

	@Mobx.observable private drafts = [];

	@Mobx.observable private project?: Project;

	@Mobx.computed
	private get items(): LibraryStoreItem[] {
		if (!this.project) {
			return [];
		}

		const derived = this.project
			.getPatternLibraries()
			.map(lib => LibraryStoreItem.fromLibrary(lib));

		return _.uniqBy([...this.recommendations, ...derived], ['name', 'version']);
	}

	@Mobx.computed
	public get recommendations(): LibraryStoreItem[] {
		return this.recommended.map(name =>
			LibraryStoreItem.fromRecommendation(name, { project: this.project })
		);
	}

	@Mobx.computed
	public get withLibrary(): LibraryStoreItem[] {
		return this.items.filter(item => item.hasLibrary);
	}

	public constructor(init?: LibraryStoreInit) {
		this.project = init ? init.project : undefined;
	}

	public getItemByPackageName(name: string): LibraryStoreItem | undefined {
		return this.items.find(item => item.packageName === name);
	}

	@Mobx.action
	public setProject(project: Project): void {
		this.project = project;
	}
}

export enum LibraryStoreItemType {
	Recommended,
	Remote,
	Local
}

export enum LibraryStoreItemState {
	Unknown,
	Listed,
	Installing,
	Installed
}
