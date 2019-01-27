import * as Mobx from 'mobx';
import * as uuid from 'uuid';
import * as semver from 'semver';
import { PatternLibrary } from './pattern-library';
import { LibraryStoreItemType, LibraryStoreItemState } from './library-store';
import { Project } from './project';
import * as T from '../types';
import * as M from '../message';
import { PatternLibraryInstallType, PatternLibraryOrigin } from '../types';

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
	@Mobx.observable private internalItemName: string;
	@Mobx.observable private internalItemVersion: string;

	@Mobx.observable private intermediateState: LibraryStoreItemState;
	@Mobx.observable private meta?: any;
	@Mobx.observable private update?: any;

	@Mobx.computed
	public get hasUpdate(): boolean {
		return typeof this.update !== 'undefined';
	}

	@Mobx.computed
	public get itemName(): string {
		if (this.meta) {
			return typeof this.meta.name !== 'undefined' ? this.meta.name : this.internalItemName;
		}

		return this.internalItemName;
	}

	@Mobx.computed
	public get itemVersion(): string {
		if (this.meta) {
			return typeof this.meta.version !== 'undefined'
				? this.meta.version
				: this.internalItemVersion;
		}

		return this.internalItemVersion;
	}

	@Mobx.computed
	public get fetched(): boolean {
		if (!this.meta) {
			return false;
		}

		return this.meta.version === this.version && this.meta.name === this.packageName;
	}

	@Mobx.computed
	public get hasLibrary(): boolean {
		return typeof this.library !== 'undefined';
	}

	@Mobx.computed
	public get state(): LibraryStoreItemState {
		if (!this.library) {
			return this.intermediateState;
		}

		if (this.hasUpdate) {
			return LibraryStoreItemState.NeedsUpdate;
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
		const alva = this.meta ? this.meta.alva || {} : {};
		return this.library ? this.library.getColor() : alva.color;
	}

	@Mobx.computed
	public get image(): string | undefined {
		const alva = this.meta ? this.meta.alva || {} : {};
		return this.library ? this.library.getImage() : alva.image;
	}

	@Mobx.computed
	public get name(): string | undefined {
		const meta = this.meta ? this.meta : {};
		return this.library
			? this.library.getName()
			: meta
				? meta.name || this.itemName
				: this.itemName;
	}

	@Mobx.computed
	public get displayName(): string | undefined {
		const alva = this.meta ? this.meta.alva || {} : {};
		return this.library
			? this.library.getDisplayName()
			: alva
				? alva.name || this.name
				: this.name;
	}

	@Mobx.computed
	public get description(): string | undefined {
		const meta = this.meta ? this.meta : {};
		return this.library ? this.library.getDescription() : meta.description;
	}

	@Mobx.computed
	public get version(): string | undefined {
		const meta = this.meta ? this.meta : {};
		return this.library
			? this.library.getVersion()
			: meta
				? meta.version || this.itemVersion
				: this.itemVersion;
	}

	@Mobx.computed
	public get homepage(): string | undefined {
		const meta = this.meta ? this.meta : {};
		return this.library ? this.library.getHomepage() : meta.homepage;
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

	@Mobx.computed
	public get usesRemoteMeta(): boolean {
		return (
			this.hasLibrary &&
			(this.installType !== PatternLibraryInstallType.Remote ||
				this.origin !== PatternLibraryOrigin.UserProvided)
		);
	}

	public constructor(init: LibraryStoreItemInit) {
		this.id = init.id || uuid.v4();
		this.library = init.library;
		this.type = init.type;
		this.internalItemName = init.name;
		this.internalItemVersion = init.version;

		this.intermediateState =
			this.type === LibraryStoreItemType.Recommended
				? LibraryStoreItemState.Listed
				: LibraryStoreItemState.Unknown;

		Mobx.autorun(() => {
			if (!this.fetched) {
				this.fetch();
			}

			this.checkForUpdate();
		});
	}

	public static fromRecommendation(
		name: { name: string; version: string },
		ctx: { project?: Project }
	): LibraryStoreItem {
		const library = ctx.project
			? ctx.project.getPatternLibraryByPackageName(name.name)
			: undefined;

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
	public fetch = Mobx.flow<void>(function*(this: LibraryStoreItem): IterableIterator<any> {
		if (this.usesRemoteMeta) {
			return;
		}

		const response = yield (fetch(
			`https://registry.npmjs.cf/${this.packageName}`
		) as unknown) as Response;

		if (!response.ok) {
			this.meta = undefined;
			return;
		}

		const data = yield response.json();
		const version = data['dist-tags'][this.version!] || this.version!;
		const meta = data['versions'][version];

		if (!meta) {
			this.meta = undefined;
			return;
		}

		this.meta = meta;
	});

	@Mobx.action
	public connect(
		sender: { send: T.Sender['send']; transaction: T.Sender['transaction'] },
		data: { project: Project; npmId?: string; installType?: PatternLibraryInstallType }
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
					npmId: data.npmId || this.packageName!,
					projectId: data.project.getId()
				}
			});
		}

		if (!this.library) {
			return;
		}

		if (this.installType === T.PatternLibraryInstallType.Local) {
			this.intermediateState = LibraryStoreItemState.Installing;
			this.library.setState(T.PatternLibraryState.Connecting);
			this.update = undefined;

			sender.send({
				id: uuid.v4(),
				type: M.MessageType.UpdatePatternLibraryRequest,
				payload: {
					projectId: data.project.getId(),
					libId: this.library.getId(),
					installType: data.installType || this.installType!
				}
			});
		}

		if (this.installType === T.PatternLibraryInstallType.Remote) {
			this.intermediateState = LibraryStoreItemState.Installing;
			this.library.setState(T.PatternLibraryState.Connecting);
			this.update = undefined;

			sender.send({
				id: uuid.v4(),
				type: M.MessageType.UpdateNpmPatternLibraryRequest,
				payload: {
					projectId: data.project.getId(),
					libId: this.library.getId(),
					npmId: data.npmId,
					installType: data.installType || this.installType!
				}
			});
		}
	}

	@Mobx.action
	public checkForUpdate = Mobx.flow<void>(function*(
		this: LibraryStoreItem
	): IterableIterator<any> {
		if (
			!this.version ||
			!this.library ||
			this.installType !== PatternLibraryInstallType.Remote ||
			this.origin !== PatternLibraryOrigin.UserProvided
		) {
			return;
		}

		const response = yield (fetch(
			`https://registry.npmjs.cf/${this.packageName}`
		) as unknown) as Response;

		if (!response.ok) {
			return;
		}

		const data = yield response.json();
		const latestVersion = (data['dist-tags'] || {}).latest;
		const latestData = data.versions[latestVersion];

		if (!latestData) {
			return;
		}

		if (semver.gt(latestVersion, this.version)) {
			this.update = latestData;
		}
	});
}
