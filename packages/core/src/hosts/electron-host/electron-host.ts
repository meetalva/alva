import * as Os from 'os';
import * as Fs from 'fs';
import * as Path from 'path';
import * as Util from 'util';
import * as Types from '@meetalva/types';
import * as getPort from 'get-port';
import * as Electron from 'electron';
import { createWindow } from './create-window';
import { AlvaApp } from '@meetalva/model';
import * as Mobx from 'mobx';
import * as Message from '@meetalva/message';
import * as ElectronLog from 'electron-log';
import Project from 'ts-simple-ast';

ElectronLog.transports.console.level = 'info';
ElectronLog.transports.file.level = 'silly';

export interface ElectronHostInit {
	process: NodeJS.Process;
	forced?: Partial<Types.HostFlags>;
}

export class ElectronHost
	implements Types.Host<AlvaApp<Message.Message>, Project, Message.Message> {
	public type = Types.HostType.Electron;

	private forced?: Partial<Types.HostFlags>;
	private process: NodeJS.Process;
	private sender?: Types.Sender<Message.Message>;
	private windows: Map<string | number, Electron.BrowserWindow> = new Map();
	@Mobx.observable private apps: Map<string, AlvaApp<Message.Message>> = new Map();

	private constructor(init: ElectronHostInit) {
		this.process = init.process;
		this.forced = init.forced;
	}

	public static async from(init: ElectronHostInit): Promise<ElectronHost> {
		return new ElectronHost(init);
	}

	public async createWindow(options: Types.HostWindowOptions): Promise<Electron.BrowserWindow> {
		const win = await createWindow(options);
		this.windows.set(win.id, win);
		return win;
	}

	public async getFlags(): Promise<Types.HostFlags> {
		const yargsParser = require('yargs-parser');
		return {
			...yargsParser(this.process.argv.slice(2), {
				number: ['port'],
				boolean: ['localhost', 'force-updates']
			}),
			...this.forced
		};
	}

	public async getPort(requested: number): Promise<number> {
		return getPort({ port: requested });
	}

	public async log(message?: unknown, ...optionalParams: unknown[]): Promise<void> {
		ElectronLog.log(message, ...optionalParams);
	}

	public async resolveFrom(base: Types.HostBase, ...paths: string[]): Promise<string> {
		const getBasePath = (b: Types.HostBase): string => {
			switch (b) {
				case Types.HostBase.Source:
					return Path.resolve(__dirname, '..', '..');
				case Types.HostBase.AppData:
					return Path.resolve(Os.tmpdir(), 'alva');
				case Types.HostBase.AppPath:
					return Electron.app.getAppPath();
				case Types.HostBase.UserData:
					return Electron.app.getPath('userData');
				case Types.HostBase.UserHome:
					return Os.homedir();
			}
		};

		return Path.resolve(...[getBasePath(base), ...paths]);
	}

	public async exists(path: string): Promise<boolean> {
		return Fs.existsSync(path);
	}

	public access(path: string, mode: number | undefined): Promise<boolean> {
		return new Promise(resolve => {
			Fs.access(path, mode, err => {
				if (err) {
					return resolve(false);
				}

				resolve(true);
			});
		});
	}

	public async stat(path: string): Promise<Fs.Stats> {
		return new Promise((resolve, reject) => {
			Fs.stat(path, (err, stats) => {
				if (err) {
					return reject(err);
				}

				resolve(stats);
			});
		});
	}

	public async mkdir(path: string): Promise<void> {
		const mkdir = Util.promisify(Fs.mkdir);

		if (!Fs.existsSync(path)) {
			await mkdir(path);
		}
	}

	public async readFile(path: string): Promise<Types.HostFile> {
		const readFile = Util.promisify(Fs.readFile);
		const buffer = await readFile(path);

		return {
			path,
			buffer,
			contents: buffer.toString('utf-8')
		};
	}

	public async saveFile(path: string, data: unknown): Promise<void> {
		return;
	}

	public async writeFile(path: string, data: unknown): Promise<void> {
		const writeFile = Util.promisify(Fs.writeFile);
		return writeFile(path, data);
	}

	public async open(uri: string): Promise<void> {
		Electron.shell.openExternal(uri);
		return;
	}

	public selectFile(opts: Electron.OpenDialogOptions): Promise<void | string> {
		return new Promise(resolve => {
			Electron.dialog.showOpenDialog(opts, (paths: string[]) => {
				if (!paths) {
					return resolve();
				}

				resolve(paths[0]);
			});
		});
	}

	public selectSaveFile(opts: Electron.SaveDialogOptions): Promise<void | string> {
		return new Promise(resolve => {
			Electron.dialog.showSaveDialog(opts, (path: string | null) => {
				if (!path) {
					return resolve();
				}

				resolve(path);
			});
		});
	}

	public async showMessage(
		opts: Types.HostMessageOptions<Message.Message>
	): Promise<undefined | Types.HostMessageButton<Message.Message>> {
		const cancelId = opts.buttons.findIndex(b => typeof b.cancel !== 'undefined' && b.cancel);
		const defaultId = opts.buttons.findIndex(
			b => typeof b.selected !== 'undefined' && b.selected
		);

		const result = Electron.dialog.showMessageBox({
			type: opts.type,
			message: opts.message,
			detail: opts.detail,
			cancelId,
			defaultId,
			buttons: opts.buttons.map(button => button.label)
		});

		if (typeof result === 'undefined') {
			return;
		}

		const button = opts.buttons[result];

		if (!button) {
			return;
		}

		if (button.message && button && this.sender) {
			this.sender.send(button.message);
		}

		return button;
	}

	public async showContextMenu(opts: {
		items: Types.ContextMenuItem<AlvaApp<Message.Message>, Message.Message>[];
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

	@Mobx.action
	public async addApp(app: any): Promise<void> {
		this.apps.set(app.getId(), app);
		return;
	}

	public async getApp(id: string): Promise<AlvaApp<Message.Message> | undefined> {
		return this.apps.get(id);
	}

	public async getSender(): Promise<Types.Sender<Message.Message>> {
		return this.sender!;
	}

	public setSender(sender: Types.Sender<Message.Message>) {
		this.sender = sender;
		this.sender.setLog((m: string, message: Message.Message) => {
			this.log(m, message.type, message.id);
			ElectronLog.silly(message);
		});
	}
}
