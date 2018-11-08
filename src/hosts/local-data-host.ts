import * as Types from '../types';
import * as Model from '../model';
import * as Path from 'path';

export class LocalDataHost implements Types.DataHost {
	private host: Types.Host;

	private constructor({ host }: { host: Types.Host }) {
		this.host = host;
	}

	public static async fromHost(host: Types.Host): Promise<Types.DataHost> {
		return new LocalDataHost({ host });
	}

	private async readMemory(): Promise<{ projects: { [id: string]: string } }> {
		const path = await this.host.resolveFrom(Types.HostBase.UserData, 'projects.json');
		const file = await this.host.readFile(path).catch(() => undefined);
		return Promise.resolve()
			.then(() => (file ? JSON.parse(file.contents) : { projects: {} }))
			.catch(() => ({ projects: {} }));
	}

	private async writeMemory(memory: { projects: { [id: string]: string } }): Promise<void> {
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
	}

	public async getProject(id: string): Promise<Model.Project | undefined> {
		const memory = await this.readMemory();
		const projectPath = memory.projects[id];

		if (!projectPath) {
			return;
		}

		const file = await this.host.readFile(projectPath);
		return Model.Project.from(JSON.parse(file.contents));
	}
}
