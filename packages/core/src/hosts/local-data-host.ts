import * as Types from '../types';
import * as Model from '../model';
import * as Path from 'path';
import { Persistence } from '../persistence';

export class LocalDataHost implements Types.DataHost {
	private host: Types.Host;
	private cache: Map<string, Model.Project> = new Map();

	private constructor({ host }: { host: Types.Host }) {
		this.host = host;
	}

	public static async fromHost(host: Types.Host): Promise<Types.DataHost> {
		return new LocalDataHost({ host });
	}

	private async readMemory(): Promise<{
		projects: { [id: string]: string };
		connections: { [id: string]: { id: string; path: string }[] };
		update?: Types.UpdateInfo;
	}> {
		const path = await this.host.resolveFrom(Types.HostBase.UserData, 'projects.json');
		const file = await this.host.readFile(path).catch(() => undefined);
		return Promise.resolve()
			.then(() => (file ? JSON.parse(file.contents) : { projects: {}, connections: {} }))
			.catch(() => ({ projects: {}, connections: {} }));
	}

	private async writeMemory(memory: {
		projects: { [id: string]: string };
		connections: { [id: string]: { id: string; path: string }[] };
		update?: Types.UpdateInfo;
	}): Promise<void> {
		const path = await this.host.resolveFrom(Types.HostBase.UserData, 'projects.json');
		const parent = Path.dirname(path);

		if (!await this.host.exists(parent)) {
			await this.host.mkdir(parent);
		}

		return this.host.writeFile(path, JSON.stringify(memory));
	}

	public async setUpdate(update: Types.UpdateInfo): Promise<void> {
		const memory = await this.readMemory();
		memory.update = update;
		await this.writeMemory(memory);
	}

	public async removeUpdate(): Promise<void> {
		const memory = await this.readMemory();
		memory.update = undefined;
		await this.writeMemory(memory);
	}

	public async getUpdate(): Promise<Types.UpdateInfo | undefined> {
		const memory = await this.readMemory();
		return memory.update;
	}

	public async addProject(project: Model.Project): Promise<void> {
		const memory = await this.readMemory();
		memory.projects[project.getId()] = project.getPath();
		await this.writeMemory(memory);
		this.cache.set(project.getId(), project);
	}

	public async getProject(id: string): Promise<Model.Project | undefined> {
		const memory = await this.readMemory();
		const projectPath = memory.projects[id];

		if (!projectPath) {
			return;
		}

		if (this.cache.has(id)) {
			return this.cache.get(id);
		}

		const file = await this.host.readFile(projectPath);

		const parsed = await Persistence.parse<Types.SerializedProject>(file.contents);

		if (parsed.state === Types.PersistenceState.Error) {
			// TODO: Error handling
			return;
		}

		const project = Model.Project.from(parsed.contents);
		this.cache.set(project.getId(), project);

		return project;
	}

	public async addConnection(
		project: Model.Project,
		item: {
			id: string;
			path: string;
		}
	): Promise<void> {
		const memory = await this.readMemory();
		const previous = memory.connections[(project as any).id] || [];
		memory.connections[(project as any).id] = [...previous, item];
		await this.writeMemory(memory);
	}

	public async getConnections(project: Model.Project): Promise<{ id: string; path: string }[]> {
		const memory = await this.readMemory();
		return memory.connections[(project as any).id] || [];
	}
}
