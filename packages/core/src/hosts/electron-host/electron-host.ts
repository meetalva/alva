import * as Os from 'os';
import * as Fs from 'fs';
import * as Path from 'path';
import * as Util from 'util';
import * as Types from '../../types';
import * as getPort from 'get-port';
import * as Electron from 'electron';
import { createWindow } from './create-window';
import { AlvaApp } from '../../model';
import * as Mobx from 'mobx';
import * as Message from '../../message';
import * as ElectronLog from 'electron-log';

ElectronLog.transports.console.level = 'info';
ElectronLog.transports.file.level = 'silly';

export interface ElectronHostInit {
	process: NodeJS.Process;
	forced?: Partial<Types.HostFlags>;
}

export class ElectronHost implements Types.Host {
	public type = Types.HostType.Electron;

	private forced?: Partial<Types.HostFlags>;
	private process: NodeJS.Process;
	private sender?: Types.Sender;
	private windows: Map<string | number, Electron.BrowserWindow> = new Map();
	@Mobx.observable private apps: Map<string, AlvaApp> = new Map();

	private constructor(init: ElectronHostInit) {
		this.process = init.process;
		this.forced = init.forced;
	}

	public static async from(init: ElectronHostInit): Promise<ElectronHost> {
		return new ElectronHost(init);
	}

	public async createWindow(address: string): Promise<Electron.BrowserWindow> {
		const win = await createWindow(address);
		this.windows.set(win.id, win);

		/* win.on('close', async e => {
			if (!this.windows.get(win.id)) {
				return;
			}

			e.preventDefault();
			const parsed = Url.parse(win.webContents.getURL());
			const [prefix, id] = (parsed.pathname || '').split('/').filter(Boolean);
			const project = await this.dataHost.getProject(id);

			if (prefix === 'project' && project && project.getDraft()) {
				const saveId = uuid.v4();
				const cancelId = uuid.v4();
				const discardId = uuid.v4();

				const result = await this.showMessage({
					type: 'warning',
					message: `Do you want to save the changes you made to ${project.getName()}?`,
					detail: "Your changes will be lost if you don't save them.",
					buttons: [
						{
							label: 'Save',
							id: saveId
						},
						{
							label: 'Cancel',
							id: cancelId
						},
						{
							label: "Don't Save",
							id: discardId
						}
					]
				});

				if (result && result.id === cancelId) {
					return;
				}

				if (result && result.id === saveId) {
					await this.sender.transaction<M.Save, M.SaveResult>(
						{
							type: M.MessageType.Save,
							id: uuid.v4(),
							payload: {
								publish: false,
								projectId: project.getId()
							}
						},
						{ type: M.MessageType.SaveResult }
					);
				}
			}

			this.windows.delete(win.id);
			win.close();
		}); */

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
		opts: Types.HostMessageOptions
	): Promise<undefined | Types.HostMessageButton> {
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

	@Mobx.action
	public async addApp(app: AlvaApp): Promise<void> {
		this.apps.set(app.getId(), app);
		return;
	}

	public async getApp(id: string): Promise<AlvaApp | undefined> {
		return this.apps.get(id);
	}

	public async getSender(): Promise<Types.Sender> {
		return this.sender!;
	}

	public setSender(sender: Types.Sender) {
		this.sender = sender;
		this.sender.setLog((m: string, message: Message.Message) => {
			this.log(m, message.type, message.id);
			ElectronLog.silly(message);
		});
	}
}
