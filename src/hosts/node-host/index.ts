import * as Os from 'os';
import * as Fs from 'fs';
import * as Path from 'path';
import * as Util from 'util';
import * as Types from '../../types';
import * as getPort from 'get-port';

export class NodeHost implements Types.Host {
	public type = Types.HostType.Node;

	private forced?: Partial<Types.HostFlags>;
	private process: NodeJS.Process;
	private sender: Types.Sender;

	public static async fromProcess(
		process: NodeJS.Process,
		forced?: Partial<Types.HostFlags>
	): Promise<NodeHost> {
		const host = new NodeHost();
		host.process = process;
		host.forced = forced;
		return host;
	}

	public async getFlags(): Promise<Types.HostFlags> {
		const yargsParser = require('yargs-parser');
		return {
			...yargsParser(this.process.argv.slice(2), {
				number: ['port'],
				boolean: ['localhost']
			}),
			...this.forced
		};
	}

	public async getPort(requested?: number): Promise<number> {
		return getPort({ port: requested });
	}

	public async getApp(): Promise<undefined> {
		return;
	}

	public async log(message?: unknown, ...optionalParams: unknown[]): Promise<void> {
		console.log(message, ...optionalParams);
	}

	public async resolveFrom(base: Types.HostBase, ...paths: string[]): Promise<string> {
		const getBasePath = (b: Types.HostBase): string => {
			switch (b) {
				case Types.HostBase.Source:
					return Path.resolve(__dirname, '..', '..');
				case Types.HostBase.AppData:
					return Path.resolve(Os.tmpdir(), 'alva');
				case Types.HostBase.UserData:
					return Path.resolve(Os.homedir(), 'alva');
			}
		};

		return Path.resolve(...[getBasePath(base), ...paths]);
	}

	public async exists(path: string): Promise<boolean> {
		return Fs.existsSync(path);
	}

	public async mkdir(path: string): Promise<void> {
		const mkdir = Util.promisify(Fs.mkdir);

		if (!Fs.existsSync(path)) {
			await mkdir(path);
		}
	}

	public async readFile(path: string): Promise<Types.HostFile> {
		const readFile = Util.promisify(Fs.readFile);

		return {
			path,
			contents: (await readFile(path)).toString()
		};
	}

	public async saveFile(path: string, data: unknown): Promise<void> {
		return;
	}

	public async writeFile(path: string, data: unknown): Promise<void> {
		const writeFile = Util.promisify(Fs.writeFile);
		return writeFile(path, data);
	}

	public async getSender(): Promise<Types.Sender> {
		return this.sender;
	}

	public setSender(sender: Types.Sender) {
		this.sender = sender;
	}

	public async open(uri: string): Promise<void> {
		return;
	}

	public async selectFile(): Promise<void> {
		return;
	}

	public async selectSaveFile(): Promise<void> {
		return;
	}

	public async showMessage(): Promise<undefined> {
		return;
	}

	public async showContextMenu(): Promise<undefined> {
		return;
	}

	public async writeClipboard(input: string): Promise<void> {
		return;
	}

	public async readClipboard(): Promise<string | undefined> {
		return;
	}

	public async createWindow(): Promise<void> {
		return;
	}

	public async toggleDevTools(): Promise<void> {
		return;
	}
}
