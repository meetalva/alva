import * as Types from '@meetalva/types';
import * as Model from '@meetalva/model';
import { Persistence } from '../persistence';
import * as Path from 'path';
import * as Store from '../store';
import { sortBy } from 'lodash';
import * as Mobx from 'mobx';
import { Message } from '@meetalva/message';

export class BrowserDataHost implements Types.DataHost<Model.Project> {
	private host: Types.Host<Model.AlvaApp<Message>, Model.Project, Message>;
	private store: Store.ViewStore;
	@Mobx.observable private projects: Types.ProjectRecord[] | undefined;

	public constructor({
		host,
		store
	}: {
		host: Types.Host<Model.AlvaApp<Message>, Model.Project, Message>;
		store: Store.ViewStore;
	}) {
		this.host = host;
		this.store = store;
	}

	private async readMemory(): Promise<{
		projects: { [id: string]: string };
		connections: { [id: string]: { id: string; path: string }[] };
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
	}): Promise<void> {
		const path = await this.host.resolveFrom(Types.HostBase.UserData, 'projects.json');
		const parent = Path.dirname(path);

		if (!await this.host.exists(parent)) {
			await this.host.mkdir(parent);
		}

		return this.host.writeFile(path, JSON.stringify(memory));
	}

	public async addProject(project: Model.Project): Promise<void> {
		const memory = await this.readMemory();
		memory.projects[project.getId()] = project.getPath();
		await this.writeMemory(memory);

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

	@Mobx.action
	public async checkProjects(): Promise<Types.ProjectRecord[]> {
		const memory = await this.readMemory();

		const projects = await Promise.all(
			Object.entries(memory.projects).map(async ([id, path]) => {
				const valid = await this.host.exists(path);
				const editDate = valid ? (await this.host.stat(path)).mtimeMs : undefined;

				return {
					draft: true,
					editDate,
					id,
					path,
					displayPath: '',
					name: 'Draft',
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
