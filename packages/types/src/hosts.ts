import * as Fs from 'fs';
import { ContextMenuItem } from './menu';
import { Message } from './message';
import * as Types from '.';

export enum HostType {
	Unknown = 'unknown',
	Browser = 'browser',
	Node = 'node',
	Electron = 'electron'
}

export interface HostFlags {
	_: string[];
	port?: number;
	project?: string;
	localhost?: boolean;
	serve?: boolean;
	forceUpdates?: boolean;
}

export interface HostFile {
	path: string;
	contents: string;
	buffer: Buffer;
}

export enum HostBase {
	Source,
	AppData,
	UserData,
	UserHome
}

export interface HostSelectFileOptions {
	title?: string;
	message?: string;
	properties?: (
		| 'openFile'
		| 'openDirectory'
		| 'multiSelections'
		| 'showHiddenFiles'
		| 'createDirectory'
		| 'promptToCreate'
		| 'noResolveAliases'
		| 'treatPackageAsDirectory')[];
	filters?: ({ name?: string; extensions?: string[] })[];
}

export interface HostSelectSaveFileOptions {
	title?: string;
	defaultPath?: string;
	filters?: ({ name?: string; extensions?: string[] })[];
}

export interface HostMessageButton {
	selected?: boolean;
	cancel?: boolean;
	id?: string;
	label: string;
	message?: Message;
}

export interface HostMessageOptions {
	type?: 'info' | 'warning' | 'error';
	message: string;
	detail?: string;
	buttons: HostMessageButton[];
}

export enum HostWindowVariant {
	Splashscreen,
	Normal
}

export interface HostWindowOptions {
	address: string;
	variant: HostWindowVariant;
}

export interface ProjectRecord {
	id: string;
	draft: boolean;
	name: string;
	path: string;
	displayPath: string;
	valid: boolean;
	editDate: number | undefined;
}

export abstract class Host {
	public type: HostType = HostType.Unknown;

	public async getFlags(): Promise<HostFlags> {
		throw new Error('host.getFlags: not implemented');
	}

	public async getPort(requested?: number): Promise<number> {
		throw new Error('host.getPort: not implemented');
	}

	public async log(message?: unknown, ...optionalParams: unknown[]): Promise<void> {
		throw new Error('host.log: not implemented');
	}

	public async resolveFrom(base: HostBase, ...paths: string[]): Promise<string> {
		throw new Error('host.resolveFrom: not implemented');
	}

	public async access(path: string, mode?: number): Promise<boolean> {
		throw new Error('host.access: not implemented');
	}

	public async exists(path: string): Promise<boolean> {
		throw new Error('host.exists: not implemented');
	}

	public async mkdir(path: string): Promise<void> {
		throw new Error('host.mkdir: not implemented');
	}

	public async stat(path: string): Promise<Fs.Stats> {
		throw new Error('host.stat: not implemented');
	}

	public async readFile(path: string): Promise<HostFile> {
		throw new Error('host.readFile: not implemented');
	}

	public async saveFile(path: string, contents: Buffer | string): Promise<void> {
		throw new Error('host.saveFile: not implemented');
	}

	public async writeFile(path: string, contents: Buffer | string): Promise<void> {
		throw new Error('host.writeFile: not implemented');
	}

	public async open(uri: string): Promise<void> {
		throw new Error('host.open: not implemented');
	}

	public async selectFile(opts: HostSelectFileOptions): Promise<void | string> {
		throw new Error('host.selectFile: not implemented');
	}

	public async selectSaveFile(opts: HostSelectSaveFileOptions): Promise<void | string> {
		throw new Error('host.selectSaveFile: not implemented');
	}

	public async showMessage(opts: HostMessageOptions): Promise<HostMessageButton | undefined> {
		throw new Error('host.showMessage: not implemented');
	}

	public async showContextMenu(opts: {
		items: ContextMenuItem[];
		position: { x: number; y: number };
	}): Promise<void> {
		throw new Error('host.showContextMenu: not implemented');
	}

	public async writeClipboard(input: string): Promise<void> {
		throw new Error('host.writeClipboard: not implemented');
	}

	public async readClipboard(): Promise<string | undefined> {
		throw new Error('host.readClipboard: not implemented');
	}

	public async createWindow<T = unknown>(opts: HostWindowOptions): Promise<T | undefined> {
		throw new Error('host.createWindow: not implemented');
	}

	public async toggleDevTools(): Promise<void> {
		throw new Error('host.toggleDevTools: not implemented');
	}

	public async getApp(id: string): Promise<Types.AlvaApp | undefined> {
		throw new Error('host.getApp: not implemented');
	}

	public async addApp(app: Types.AlvaApp): Promise<void> {
		throw new Error('host.addApp: not implemented');
	}

	public async getSender(): Promise<Types.Sender> {
		throw new Error('host.getSender: not implemented');
	}

	public setSender(sender: Types.Sender): void {
		throw new Error('host.setSender: not implemented');
	}
}

export abstract class DataHost<T = unknown> {
	public async addProject(project: T): Promise<void> {
		throw new Error('DataHost.addProject: not implemented');
	}

	public async getProject(id: string): Promise<T | undefined> {
		throw new Error('DataHost.getProject: not implemented');
	}

	public async getProjects(): Promise<ProjectRecord[]> {
		throw new Error('context.getProjects: not implemented');
	}

	public async checkProjects(): Promise<ProjectRecord[]> {
		throw new Error('context.checkProjects: not implemented');
	}

	public async addConnection(
		project: T,
		opts: {
			id: string;
			path: string;
		}
	): Promise<void> {
		throw new Error('DataHost.addConnection: not implemented');
	}

	public async getConnections(project: T): Promise<{ id: string; path: string }[]> {
		throw new Error('DataHost.getConnections: not implemented');
	}

	public async setUpdate(update: Types.UpdateInfo): Promise<void> {
		throw new Error('DataHost.getConnections: not implemented');
	}

	public async removeUpdate(): Promise<void> {
		throw new Error('DataHost.getConnections: not implemented');
	}

	public async getUpdate(): Promise<Types.UpdateInfo | undefined> {
		throw new Error('DataHost.getConnections: not implemented');
	}
}

export interface MatcherContext {
	host: Host;
	dataHost: DataHost;
	location: Types.Location;
}

export type Matcher<T extends Message> = (m: T) => Promise<void>;
