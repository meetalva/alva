import * as Os from 'os';
import * as Fs from 'fs';
import * as Path from 'path';
import * as Util from 'util';
import * as Types from '../../types';
import * as getPort from 'get-port';
import * as Electron from 'electron';
import { createWindow } from './create-window';
import * as M from '../../message';
import * as Mobx from 'mobx';
import * as Model from '../../model';
import * as Menu from '../../menu';

export interface ElectronHostInit {
	process: NodeJS.Process;
	forced?: Partial<Types.HostFlags>;
}

export class ElectronHost implements Types.Host {
	public type = Types.HostType.Electron;

	private forced?: Partial<Types.HostFlags>;
	private process: NodeJS.Process;
	private server: Types.AlvaServer;
	private dataHost: Types.DataHost;

	private windows: Map<string | number, Electron.BrowserWindow> = new Map();

	@Mobx.observable private apps: Map<string, Model.AlvaApp> = new Map();
	@Mobx.observable private focusedAppId: string | undefined;
	@Mobx.observable private focusedProjectId: string | undefined;

	@Mobx.computed
	public get focusedApp(): Model.AlvaApp | undefined {
		return this.focusedAppId ? this.apps.get(this.focusedAppId) : undefined;
	}

	@Mobx.computed
	public get focusedProject(): Promise<Model.Project | undefined> {
		return this.focusedProjectId
			? this.dataHost.getProject(this.focusedProjectId)
			: Promise.resolve(undefined);
	}

	private constructor(init: ElectronHostInit) {
		this.process = init.process;
		this.forced = init.forced;
	}

	public static async from(init: ElectronHostInit): Promise<ElectronHost> {
		return new ElectronHost(init);
	}

	public async start(server: Types.AlvaServer, dataHost: Types.DataHost): Promise<void> {
		this.server = server;
		this.dataHost = dataHost;

		this.server.sender.match<M.WindowFocused>(M.MessageType.WindowFocused, m => {
			const app = Model.AlvaApp.from(m.payload.app);
			this.apps.set(app.getId(), app);
			this.focusedAppId = app.getId();
			this.focusedProjectId = m.payload.projectId;
		});

		this.server.sender.match<M.ChangeApp>(M.MessageType.ChangeApp, m => {
			const app = Model.AlvaApp.from(m.payload.app);
			this.apps.set(app.getId(), app);
		});

		Electron.app.commandLine.appendSwitch('--enable-viewport-meta', 'true');
		Electron.app.commandLine.appendSwitch('--disable-pinch', 'true');

		const win = await createWindow(`http://localhost:${server.port}/`);
		this.windows.set(win.id, win);

		Mobx.autorun(async () => {
			const ctx = {
				app: this.focusedApp,
				project: await this.focusedProject
			};

			const toElectronAction = (item: Types.MenuItem): Electron.MenuItemConstructorOptions[] => {
				if (typeof (item as any).click === 'function') {
					const actionable = item as Types.ActionableMenuItem;
					const onClick = actionable.click!;
					actionable.click = () => onClick(server.sender);
				}

				if (Array.isArray((item as any).submenu)) {
					const nested = item as Types.NestedMenuItem;
					(nested as any).submenu = nested.submenu.map(m => toElectronAction(m));
				}

				return item as any;
			};

			const template = [
				Menu.appMenu(ctx),
				Menu.fileMenu(ctx),
				Menu.editMenu(ctx),
				Menu.libraryMenu(ctx),
				Menu.viewMenu(ctx),
				Menu.windowMenu(ctx),
				Menu.helpMenu(ctx)
			].map(toElectronAction);

			const menu = Electron.Menu.buildFromTemplate(template as any);
			Electron.Menu.setApplicationMenu(menu);
		});
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
	public async getPort(requested: number): Promise<number> {
		return getPort({ port: requested });
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

	public async writeFile(path: string, data: unknown): Promise<void> {
		const writeFile = Util.promisify(Fs.writeFile);
		return writeFile(path, data);
	}

	public async open(uri: string): Promise<void> {
		return;
	}

	public async selectFile(): Promise<void> {
		return;
	}

	public async showMessage(): Promise<undefined> {
		return;
	}

	public async showContextMenu(): Promise<undefined> {
		return;
	}
}
