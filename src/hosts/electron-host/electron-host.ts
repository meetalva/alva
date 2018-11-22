import * as Os from 'os';
import * as Fs from 'fs';
import * as Path from 'path';
import * as Util from 'util';
import * as Types from '../../types';
import * as getPort from 'get-port';
import * as Electron from 'electron';
import { createWindow } from './create-window';
import { ElectronMainMenu } from './electron-main-menu';
import * as M from '../../message';
import { AlvaApp } from '../../model';
import * as ContextMenu from '../../context-menu';

export interface ElectronHostInit {
	process: NodeJS.Process;
	forced?: Partial<Types.HostFlags>;
}

export class ElectronHost implements Types.Host {
	public type = Types.HostType.Electron;

	private forced?: Partial<Types.HostFlags>;
	private process: NodeJS.Process;
	private menu: ElectronMainMenu;
	private sender: Types.Sender;
	private windows: Map<string | number, Electron.BrowserWindow> = new Map();

	private constructor(init: ElectronHostInit) {
		this.process = init.process;
		this.forced = init.forced;
		this.menu = new ElectronMainMenu();
	}

	public static async from(init: ElectronHostInit): Promise<ElectronHost> {
		return new ElectronHost(init);
	}

	public async start(server: Types.AlvaServer): Promise<void> {
		this.sender = server.sender;

		Electron.app.commandLine.appendSwitch('--enable-viewport-meta', 'true');
		Electron.app.commandLine.appendSwitch('--disable-pinch', 'true');

		Electron.app.on('window-all-closed', () => {
			if (process.platform !== 'darwin') {
				Electron.app.quit();
			}
		});

		Electron.app.on('activate', async () => {
			if (process.platform === 'darwin' && this.windows.size === 0) {
				this.createWindow(`http://localhost:${server.port}/`);
			}
		});

		server.sender.match<M.ToggleDevTools>(M.MessageType.ToggleDevTools, async () => {
			await this.toggleDevTools();
		});

		server.sender.match<M.ContextMenuRequest>(M.MessageType.ContextMenuRequest, async m => {
			if (m.payload.menu === Types.ContextMenuType.ElementMenu) {
				const project = await server.dataHost.getProject(m.payload.projectId);

				if (!project) {
					return;
				}

				const element = project.getElementById(m.payload.data.element.id);

				if (!element) {
					return;
				}

				const app = await this.getApp();

				if (!app) {
					return;
				}

				await this.showContextMenu({
					position: m.payload.position,
					items: ContextMenu.elementContextMenu({
						app,
						project,
						element
					})
				});
			}
		});

		this.createWindow(`http://localhost:${server.port}/`);
		this.menu.start(server);
	}

	public async createWindow(address: string): Promise<Electron.BrowserWindow> {
		const win = await createWindow(address);
		this.windows.set(win.id, win);

		win.on('close', () => {
			this.windows.delete(win.id);
		});

		return win;
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

	public async getApp(): Promise<AlvaApp | undefined> {
		return this.menu.focusedApp;
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
		Electron.shell.openExternal(uri);
		return;
	}

	public selectFile(opts): Promise<void> {
		return new Promise(resolve => {
			Electron.dialog.showOpenDialog(opts, paths => {
				if (!paths) {
					return resolve();
				}

				resolve(paths[0]);
			});
		});
	}

	public async showMessage(opts: Types.HostMessageOptions): Promise<undefined> {
		const result = Electron.dialog.showMessageBox({
			type: opts.type,
			message: opts.message,
			detail: opts.detail,
			buttons: opts.buttons.map(button => button.label)
		});

		if (!result) {
			return;
		}

		const button = opts.buttons[result];

		if (!button || !button.message) {
			return;
		}

		this.sender.send(button.message);
		return;
	}

	public async showContextMenu(opts: {
		items: Types.ContextMenuItem[];
		position: { x: number; y: number };
	}): Promise<void> {
		const focusedWindow = Electron.BrowserWindow.getFocusedWindow();

		if (!focusedWindow || focusedWindow === null) {
			return;
		}

		Electron.Menu.buildFromTemplate(
			opts.items.map(o => ({
				...o,
				click: () => (o as any).click(this.sender)
			}))
		).popup({ window: focusedWindow });
	}

	public async toggleDevTools(): Promise<void> {
		const window = Electron.BrowserWindow.getFocusedWindow();
		if (window) {
			window.webContents.toggleDevTools();
		}
	}

	public async writeClipboard(input: string): Promise<void> {
		Electron.clipboard.writeText(input);
	}

	public async readClipboard(): Promise<string | undefined> {
		return Electron.clipboard.readText();
	}
}
