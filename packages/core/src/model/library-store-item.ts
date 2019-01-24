import * as Mobx from 'mobx';
import * as uuid from 'uuid';
import { PatternLibrary } from './pattern-library';
import { LibraryStoreItemType, LibraryStoreItemState } from './library-store';
import { Project } from './project';
import * as T from '../types';
import * as M from '../message';

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

	@Mobx.observable private intermediateState: LibraryStoreItemState;

	@Mobx.computed
	public get hasLibrary(): boolean {
		return typeof this.library !== 'undefined';
	}

	@Mobx.computed
	public get state(): LibraryStoreItemState {
		if (!this.library) {
			return this.intermediateState;
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

	@Mobx.computed
	public get installType(): T.PatternLibraryInstallType | undefined {
		return this.library ? this.library.getInstallType() : T.PatternLibraryInstallType.Remote;
	}

	@Mobx.computed
	public get packageName(): string | undefined {
		return this.library ? this.library.getPackageName() : this.itemName;
	}

	@Mobx.computed
	public get origin(): string | undefined {
		return this.library ? this.library.getOrigin() : T.PatternLibraryOrigin.Unknown;
	}

	public constructor(init: LibraryStoreItemInit) {
		this.id = init.id || uuid.v4();
		this.library = init.library;
		this.type = init.type;
		this.itemName = init.name;
		this.itemVersion = init.version;
		this.intermediateState =
			this.type === LibraryStoreItemType.Recommended
				? LibraryStoreItemState.Listed
				: LibraryStoreItemState.Unknown;
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

	@Mobx.action
	public connect(
		sender: { send: T.Sender['send']; transaction: T.Sender['transaction'] },
		data: { project: Project }
	): void {
		if (this.state === LibraryStoreItemState.Installing) {
			return;
		}

		if (
			this.state === LibraryStoreItemState.Listed &&
			this.installType === T.PatternLibraryInstallType.Remote
		) {
			this.intermediateState = LibraryStoreItemState.Installing;

			sender.send({
				id: uuid.v4(),
				type: M.MessageType.ConnectNpmPatternLibraryRequest,
				payload: {
					npmId: this.packageName!,
					projectId: data.project.getId()
				}
			});
		}

		if (this.library && this.installType === T.PatternLibraryInstallType.Local) {
			sender.send({
				id: uuid.v4(),
				type: M.MessageType.UpdatePatternLibraryRequest,
				payload: {
					projectId: data.project.getId(),
					libId: this.library.getId(),
					installType: this.installType
				}
			});
		}
	}
}
