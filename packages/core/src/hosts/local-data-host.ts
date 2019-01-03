import * as Types from '../types';
import * as Model from '../model';
import * as Path from 'path';
import { Persistence } from '../persistence';
import * as Fs from 'fs';
import { sortBy } from 'lodash';
import * as Mobx from 'mobx';
import { pathExists } from 'fs-extra';

export class LocalDataHost implements Types.DataHost {
	private host: Types.Host;
	private cache: Map<string, Model.Project> = new Map();
	@Mobx.observable private projects: Types.ProjectRecord[] | undefined;

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

	@Mobx.action
	public async checkProjects(): Promise<Types.ProjectRecord[]> {
		const memory = await this.readMemory();
		const tempPath = await this.host.resolveFrom(Types.HostBase.AppData, '.');
		const userPath = Path.dirname(await this.host.resolveFrom(Types.HostBase.UserData, '.'));

		const projects = await Promise.all(
			Object.entries(memory.projects).map(async ([id, path]) => {
				const valid = await this.host.access(path, Fs.constants.R_OK);
				const editDate = valid ? (await this.host.stat(path)).mtimeMs : undefined;

				const draft =
					this.host.type === Types.HostType.Electron
						? !Path.relative(tempPath, path).startsWith('../')
						: true;
				const displayPath = Path.dirname(
					path.replace(new RegExp(`^(${tempPath}|${userPath})`), '~')
				);

				return {
					draft,
					editDate,
					id,
					path,
					displayPath,
					name: draft ? 'Draft' : Path.basename(path, Path.extname(path)),
					valid
				};
			})
		);

		const sortedProjects = sortBy(projects, ['editDate', 'name']).reverse();
		this.projects = sortedProjects;
		return sortedProjects;
	}

	public async getProjects(): Promise<Types.ProjectRecord[]> {
		if (!this.projects) {
			return this.checkProjects();
		}

		return this.projects;
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
