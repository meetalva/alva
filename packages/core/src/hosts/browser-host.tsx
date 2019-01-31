import * as Types from '@meetalva/types';
import * as Store from '../store';
import * as React from 'react';
import * as MobxReact from 'mobx-react';
import * as ReactDOM from 'react-dom';
import * as Menu from '../container/menu';
import * as Path from 'path';
import * as Mobx from 'mobx';
import * as Fs from 'fs';
import { Message } from '@meetalva/message';
import * as Model from '@meetalva/model';

export class BrowserHost implements Types.Host<Model.AlvaApp<Message>, Model.Project, Message> {
	public type = Types.HostType.Browser;

	private fs?: typeof Fs;
	private container: HTMLElement;
	private menuStore: Store.MenuStore;
	private store: Store.ViewStore;
	@Mobx.observable private apps: Map<string, Model.AlvaApp<Message>> = new Map();
	private sender?: Types.Sender<Message>;

	constructor(init: { store: Store.ViewStore; fs?: typeof Fs }) {
		this.container = document.createElement('div');
		this.container.style.position = 'fixed';
		this.container.style.top = '100vh';
		this.container.style.zIndex = '97';

		this.menuStore = new Store.MenuStore([]);
		this.store = init.store;
		this.fs = init.fs;
	}

	public start() {
		document.body.appendChild(this.container);

		ReactDOM.render(
			<MobxReact.Provider store={this.store} menuStore={this.menuStore}>
				<Menu.ContextMenu />
			</MobxReact.Provider>,
			this.container
		);
	}

	public async getFlags(): Promise<Types.HostFlags> {
		return { _: [] };
	}

	public async getPort(): Promise<number> {
		return 1337;
	}

	public async resolveFrom(base: Types.HostBase, ...paths: string[]): Promise<string> {
		const getBasePath = (b: Types.HostBase): string => {
			switch (b) {
				case Types.HostBase.AppPath:
				case Types.HostBase.Source:
					return Path.resolve('/source');
				case Types.HostBase.AppData:
					return Path.resolve('/app_data');
				case Types.HostBase.UserData:
					return Path.resolve('/user_data');
				case Types.HostBase.UserHome:
					return Path.resolve('/user_home');
			}
		};

		return Path.resolve(...[getBasePath(base), ...paths]);
	}

	public exists(path: string): Promise<boolean> {
		return new Promise(resolve => {
			this.fs!.exists(path, exists => resolve(exists));
		});
	}

	public access(path: string, mode: number | undefined): Promise<boolean> {
		return this.exists(path);
	}

	public async stat(path: string): Promise<Fs.Stats> {
		return new Promise((resolve, reject) => {
			this.fs!.stat(path, (err, stats) => {
				if (err) {
					return reject(err);
				}

				resolve(stats);
			});
		});
	}

	public async mkdir(path: string): Promise<void> {
		const _mkdir = (p: string) =>
			new Promise((resolve, reject) => {
				this.fs!.mkdir(p, err => {
					if (err) {
						reject(err);
					}
					resolve();
				});
			});

		const fragments: string[] = [];

		await Promise.all(
			path.split('/').map(async f => {
				fragments.push(f);
				const p = fragments.map(f => `${f}/`).join('');

				if (!await this.exists(p)) {
					await _mkdir(p);
				}
			})
		);
	}

	public readFile(path: string): Promise<Types.HostFile> {
		return new Promise((resolve, reject) => {
			this.fs!.readFile(path, (err, contents) => {
				if (err) {
					return reject(err);
				}

				resolve({
					path,
					buffer: contents,
					contents: contents.toString()
				});
			});
		});
	}

	public writeFile(path: string, data: unknown): Promise<void> {
		return new Promise((resolve, reject) => {
			this.fs!.writeFile(path, data, err => {
				if (err) {
					return reject(err);
				}

				resolve();
			});
		});
	}

	public async log(message?: unknown, ...optionalParams: unknown[]): Promise<void> {
		console.log(message, ...optionalParams);
	}

	public download(name: string, url: string): Promise<void> {
		return new Promise(resolve => {
			const a = document.createElement('a');
			a.download = name;
			a.href = url;

			document.body.appendChild(a);
			a.click();

			window.requestIdleCallback(() => {
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				resolve();
			});
		});
	}

	public async open(url: string): Promise<void> {
		window.open(url, '_blank');
	}

	public async reload(): Promise<void> {
		window.location.reload();
	}

	public async showMessage(opts: Types.HostMessageOptions<Message>): Promise<undefined> {
		// TODO: implement custom dialogs
		alert([opts.message, opts.detail].filter(Boolean).join('\n'));
		return;
	}

	public async saveFile(path: string, contents: string): Promise<void> {
		const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		await this.download(Path.basename(path), url);
		URL.revokeObjectURL(url);
	}

	public async showContextMenu(opts: {
		items: Types.ContextMenuItem<Model.AlvaApp<Message>, Message>[];
		position: { x: number; y: number };
	}): Promise<undefined> {
		opts.items.forEach(item => this.menuStore.add(item, { depth: 0, active: false }));
		this.menuStore.position = opts.position;
		return;
	}

	public async writeClipboard(input: string): Promise<void> {
		const clipboard = (navigator as any).clipboard;

		if (!clipboard) {
			return;
		}

		clipboard.writeText(input);
	}

	public async readClipboard(): Promise<string | undefined> {
		const clipboard = (navigator as any).clipboard;

		if (!clipboard) {
			return;
		}

		return clipboard.readText();
	}

	public async createWindow(options: Types.HostWindowOptions): Promise<undefined> {
		window.open(options.address, '_blank');
		return;
	}

	public async selectFile(): Promise<void> {
		return;
	}

	public async selectSaveFile(): Promise<void> {
		return;
	}

	public async toggleDevTools(): Promise<void> {
		return;
	}

	@Mobx.action
	public async addApp(app: any): Promise<void> {
		this.apps.set(app.getId(), app);
		return;
	}

	public async getApp(id: string): Promise<Model.AlvaApp<Message> | undefined> {
		return this.apps.get(id);
	}

	public async getSender(): Promise<Types.Sender<Message>> {
		return this.sender!;
	}

	public setSender(sender: Types.Sender<Message>) {
		this.sender = sender;
	}
}
