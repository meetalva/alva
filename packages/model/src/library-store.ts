import * as Mobx from 'mobx';
import * as _ from 'lodash';
import { Project } from './project';
import { LibraryStoreItem } from './library-store-item';
import * as T from '@meetalva/types';

export interface LibraryStoreInit {
	project?: Project;
}

export class LibraryStore {
	private readonly recommended = [
		{
			name: '@meetalva/alva-design',
			version: 'latest'
		}
	];

	@Mobx.observable private project?: Project;
	@Mobx.observable private internalInstalledOpen: boolean = false;
	@Mobx.observable private meta: Map<string, any> = new Map();

	@Mobx.computed
	private get items(): LibraryStoreItem[] {
		if (!this.project) {
			return [];
		}

		const derived = this.project
			.getPatternLibraries()
			.map(lib => LibraryStoreItem.fromLibrary(lib))
			.sort((a, b) => {
				if (a.origin === T.PatternLibraryOrigin.BuiltIn) {
					return 1;
				}

				if (b.origin === T.PatternLibraryOrigin.BuiltIn) {
					return -1;
				}

				return (a.name || '').localeCompare(b.name || '');
			});

		return _.uniqBy(derived, 'packageName');
	}

	@Mobx.computed
	public get recommendations(): LibraryStoreItem[] {
		return this.recommended.map(name =>
			LibraryStoreItem.fromRecommendation(name, {
				meta: this.meta,
				getLibraryByPackageName: this.project
					? this.project.getPatternLibraryByPackageName.bind(this.project)
					: () => undefined
			})
		);
	}

	@Mobx.computed
	public get withLibrary(): LibraryStoreItem[] {
		return this.items.filter(item => item.hasLibrary);
	}

	@Mobx.computed
	public get withUpdate(): LibraryStoreItem[] {
		return this.withLibrary.filter(item => item.hasUpdate);
	}

	@Mobx.computed
	public get withProgress(): LibraryStoreItem[] {
		return this.items.filter(item => item.state === LibraryStoreItemState.Installing);
	}

	@Mobx.computed
	public get updateCount(): number {
		return this.withUpdate.length;
	}

	@Mobx.computed
	public get updateAvailable(): boolean {
		return this.updateCount > 0;
	}

	@Mobx.computed
	public get installedOpen(): boolean {
		return this.updateCount > 0 || this.internalInstalledOpen;
	}

	public set installedOpen(open: boolean) {
		this.internalInstalledOpen = open;
	}

	public constructor(init?: LibraryStoreInit) {
		this.project = init ? init.project : undefined;

		Mobx.autorun(() => {
			this.withLibrary.forEach(lib => lib.checkForUpdate());
		});

		setInterval(() => this.checkForUpdates(), 5 * 60 * 1000);
	}

	public getItemByPackageName(name: string): LibraryStoreItem | undefined {
		return this.items.find(item => item.packageName === name);
	}

	@Mobx.action
	public setProject(project: Project): void {
		this.project = project;
	}

	@Mobx.action
	public checkForUpdates(): void {
		this.items.forEach(item => item.checkForUpdate());
	}
}

export enum LibraryStoreItemType {
	Recommended = 'library-store-item-type-recommended',
	Remote = 'library-store-item-remote',
	Local = 'library-store-item-local'
}

export enum LibraryStoreItemState {
	Unknown = 'library-store-item-state-unknown',
	Listed = 'library-store-item-state-listed',
	Installing = 'library-store-item-state-installing',
	Installed = 'library-store-item-state-installed',
	NeedsUpdate = 'library-store-item-needs-update'
}
