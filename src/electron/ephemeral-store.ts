import * as Types from '../types';

const ElectronStore = require('electron-store');

interface Store {
	clear(): void;
	// tslint:disable-next-line:no-any
	get(key: string): any;
	// tslint:disable-next-line:no-any
	set(key: string, payload: any): void;
}

export interface EphemeralConnection {
	projectId: string;
	libraryId: string;
	libraryPath: string;
}

export class EphemeralStore {
	private store: Store = new ElectronStore();

	public async addConnection(connection: EphemeralConnection): Promise<void> {
		const connections = (await this.getConnections()).filter(
			c => c.libraryPath !== connection.libraryPath && c.libraryId !== connection.libraryId
		);

		connections.push(connection);
		this.store.set('connections', [...connections]);
	}

	public async clear(): Promise<void> {
		this.store.clear();
	}

	public async getConnections(): Promise<EphemeralConnection[]> {
		const raw = this.store.get('connections');

		if (!Array.isArray(raw)) {
			return [];
		}

		return raw.filter(
			item =>
				typeof item === 'object' &&
				typeof item.libraryId === 'string' &&
				typeof item.libraryPath === 'string' &&
				typeof item.projectId === 'string'
		);
	}

	public async getProjectPath(): Promise<string | undefined> {
		const raw = this.store.get('project-path');

		if (typeof raw !== 'string') {
			return;
		}

		return raw;
	}

	public async getAppState(): Promise<Types.SerializedAlvaApp | undefined> {
		return this.store.get('app-state');
	}

	public async setProjectPath(projectPath: string): Promise<void> {
		this.store.set('project-path', projectPath);
	}

	public async setAppState(app: Types.SerializedAlvaApp): Promise<void> {
		this.store.set('app-state', app);
	}
}
