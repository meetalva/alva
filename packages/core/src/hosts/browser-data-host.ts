import * as Types from '../types';
import * as Model from '../model';
import { Persistence } from '../persistence';
import * as Path from 'path';
import * as Store from '../store';

export class BrowserDataHost implements Types.DataHost {
	private host: Types.Host;
	private store: Store.ViewStore;

	public constructor({ host, store }: { host: Types.Host; store: Store.ViewStore }) {
		this.host = host;
		this.store = store;
	}

	public async addProject(project: Model.Project): Promise<void> {
		const [, projectPath] = Buffer.from(project.getId(), 'base64')
			.toString('utf-8')
			.split(':');
		const serialized = await Persistence.serialize(project);

		if (serialized.state === Types.PersistenceState.Error) {
			this.host.log(serialized.error);
			return;
		}

		try {
			await this.host.mkdir(Path.dirname(projectPath));
			await this.host.writeFile(projectPath, serialized.contents);
			return;
		} catch (err) {
			this.host.log(err);
			return;
		}
	}

	public async getProject(raw: string): Promise<Model.Project | undefined> {
		const p = this.store.getProject();

		if (p && p.getId() === raw) {
			return p;
		}

		const [, projectPath] = Buffer.from(raw, 'base64')
			.toString('utf-8')
			.split(':');

		if (!await this.host.exists(projectPath)) {
			return;
		}

		const file = await this.host.readFile(projectPath);
		const parsed = await Persistence.parse<Types.SerializedProject>(file.contents);

		if (parsed.state === Types.PersistenceState.Error) {
			this.host.log(parsed.error);
			return;
		}

		return Model.Project.from(parsed.contents);
	}

	public async addConnection(): Promise<void> {
		return;
	}

	public async getConnections(project: Model.Project): Promise<{ id: string; path: string }[]> {
		return [];
	}

	public async setUpdate(update: Types.UpdateInfo): Promise<void> {
		/** */
	}

	public async removeUpdate(): Promise<void> {
		/** */
	}

	public async getUpdate(): Promise<Types.UpdateInfo | undefined> {
		return undefined;
	}
}
