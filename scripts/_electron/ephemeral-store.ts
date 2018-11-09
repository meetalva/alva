// import * as Types from '../types';
import * as Model from '../model';

const ElectronStore = require('electron-store');

interface Store {
	clear(): void;
	delete(key: string): void;
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

	public async clear(): Promise<void> {
		this.store.clear();
	}

	public async add(project: Model.Project): Promise<void> {
		this.store.set(project.getId(), {
			path: project.getPath(),
			connections: []
		});
	}
}
