import * as Model from '../model';

export enum HostType {
	Browser = 'browser',
	Node = 'node',
	Electron = 'electron'
}

import * as Types from '../types';

export interface HostFlags {
	port?: number;
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

	public async writeFile(path: string, contents: Buffer | string): Promise<void> {
		throw new Error('host.writeFile: not implemented');
	}

	public async open(uri: string): Promise<void> {
		throw new Error('host.open: not implemented');
	}

	public async selectFile(suggestion?: string): Promise<void | string> {
		throw new Error('host.selectFile: not implemented');
	}
}

export abstract class DataHost {
	public async addProject(project: Model.Project): Promise<void> {
		throw new Error('context.addProject: not implemented');
	}

	public async getProject(id: string): Promise<Model.Project | undefined> {
		throw new Error('context.getProject: not implemented');
	}
}
