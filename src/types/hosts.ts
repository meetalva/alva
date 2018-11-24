import * as Model from '../model';
import * as Message from '../message';

export enum HostType {
	Browser = 'browser',
	Node = 'node',
	Electron = 'electron'
}

import * as Types from '../types';

export interface HostFlags {
	_: string[];
	port?: number;
	project?: string;
	localhost?: boolean;
	serve?: boolean;
}

export interface HostFile {
	path: string;
	contents: string;
}

export enum HostBase {
	Source,
	AppData,
	UserData
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
	id?: string;
	label: string;
	message?: Message.Message;
}

export interface HostMessageOptions {
	type?: 'info' | 'warning' | 'error';
	message: string;
	detail?: string;
	buttons: HostMessageButton[];
}

export abstract class Host {
	public type: Types.HostType;

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

	public async exists(path: string): Promise<boolean> {
		throw new Error('host.exists: not implemented');
	}

	public async mkdir(path: string): Promise<void> {
		throw new Error('host.mkdir: not implemented');
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
		items: Types.ContextMenuItem[];
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

	public async createWindow(_): Promise<Electron.BrowserWindow | void> {
		throw new Error('host.createWindow: not implemented');
	}

	public async toggleDevTools(): Promise<void> {
		throw new Error('host.toggleDevTools: not implemented');
	}

	public async getApp(): Promise<Model.AlvaApp | undefined> {
		throw new Error('host.getApp: not implemented');
	}

	public async getSender(): Promise<Types.Sender> {
		throw new Error('host.getSender: not implemented');
	}

	public setSender(sender: Types.Sender): void {
		throw new Error('host.setSender: not implemented');
	}
}

export abstract class DataHost {
	public async addProject(project: Model.Project): Promise<void> {
		throw new Error('context.addProject: not implemented');
	}

	public async getProject(id: string): Promise<Model.Project | undefined> {
		throw new Error('context.getProject: not implemented');
	}

	public async addConnection(
		project: Model.Project,
		library: Model.PatternLibrary
	): Promise<void> {
		throw new Error('context.addConnection: not implemented');
	}

	public async getConnections(project: Model.Project): Promise<string[]> {
		throw new Error('context.getConnections: not implemented');
	}
}

export interface MatcherContext {
	host: Types.Host;
	dataHost: Types.DataHost;
	port: number;
}

export type Matcher<T extends Message.Message> = (m: T) => Promise<void>;
