import * as Mobx from 'mobx';
import * as uuid from 'uuid';

import { PatternLibrary } from './pattern-library';
import { LibraryStoreItemType, LibraryStoreItemState } from './library-store';
import { Project } from './project';
import * as T from '../types';

export interface LibraryStoreItemInit {
	id?: string;
	library?: PatternLibrary;
	type: LibraryStoreItemType;
	name: string;
	version: string;
}

export class LibraryStoreItem {
	public readonly id: string;
	private library?: PatternLibrary;
	private type: LibraryStoreItemType;
	private itemName: string;
	private itemVersion: string;

	@Mobx.computed
	public get hasLibrary(): boolean {
		return typeof this.library !== 'undefined';
	}

	@Mobx.computed
	public get state(): LibraryStoreItemState {
		if (!this.library) {
			return this.type === LibraryStoreItemType.Recommended
				? LibraryStoreItemState.Listed
				: LibraryStoreItemState.Unknown;
		}

		switch (this.library.getState()) {
			case T.PatternLibraryState.Connecting:
				return LibraryStoreItemState.Installing;
			default:
				return LibraryStoreItemState.Installed;
		}
	}

	@Mobx.computed
	public get color(): string | undefined {
		return this.library ? this.library.getColor() : undefined;
	}

	@Mobx.computed
	public get image(): string | undefined {
		return this.library ? this.library.getImage() : undefined;
	}

	@Mobx.computed
	public get name(): string | undefined {
		return this.library ? this.library.getName() : this.itemName;
	}

	@Mobx.computed
	public get description(): string | undefined {
		return this.library ? this.library.getDescription() : undefined;
	}

	@Mobx.computed
	public get version(): string | undefined {
		return this.library ? this.library.getVersion() : this.itemVersion;
	}

	public constructor(init: LibraryStoreItemInit) {
		this.id = init.id || uuid.v4();
		this.library = init.library;
		this.type = init.type;
		this.itemName = init.name;
		this.itemVersion = init.version;
	}

	public static fromRecommendation(
		name: { name: string; version: string },
		ctx: { project?: Project }
	): LibraryStoreItem {
		const library = ctx.project ? ctx.project.getPatternLibraryByName(name.name) : undefined;

		return new LibraryStoreItem({
			library,
			type: LibraryStoreItemType.Recommended,
			name: name.name,
			version: name.version
		});
	}

	public static fromLibrary(library: PatternLibrary): LibraryStoreItem {
		const type =
			library.getInstallType() === T.PatternLibraryInstallType.Local
				? LibraryStoreItemType.Local
				: LibraryStoreItemType.Remote;

		return new LibraryStoreItem({
			library,
			type,
			name: library.getName(),
			version: library.getVersion()
		});
	}
}
