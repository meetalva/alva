import * as Types from '../types';
import * as Store from '../store';
import * as React from 'react';
import * as MobxReact from 'mobx-react';
import * as ReactDOM from 'react-dom';
import * as Menu from '../container/menu';
import * as Path from 'path';

export class BrowserHost implements Partial<Types.Host> {
	public type = Types.HostType.Browser;

	private container: HTMLElement;
	private menuStore: Store.MenuStore;
	private store: Store.ViewStore;

	constructor(init: { store: Store.ViewStore }) {
		this.container = document.createElement('div');
		this.container.style.position = 'fixed';
		this.container.style.top = '100vh';
		this.container.style.zIndex = '97';

		this.menuStore = new Store.MenuStore([]);
		this.store = init.store;
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

	public async showMessage(opts: Types.HostMessageOptions): Promise<undefined> {
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
		items: Types.ContextMenuItem[];
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

	public async createWindow(address: string): Promise<void> {
		window.open(address, '_blank');
	}
}
