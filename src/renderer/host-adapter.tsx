import * as Types from '../types';
import * as M from '../message';
import * as Store from '../store';
import * as ContextMenu from '../context-menu';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Menu from '../container/menu';
import { Persistence } from '../persistence';
import * as Path from 'path';

export class HostAdapter {
	private sender: Types.Sender;
	private store: Store.ViewStore;
	private host: BrowserHost;

	private constructor(init: { sender: Types.Sender; store: Store.ViewStore }) {
		this.sender = init.sender;
		this.store = init.store;

		this.host = new BrowserHost({
			store: this.store
		});
	}

	public static fromStore(store: Store.ViewStore): HostAdapter {
		return new HostAdapter({ sender: store.getSender(), store });
	}

	public start() {
		this.host.start();

		this.sender.match<M.OpenExternalURL>(M.MessageType.OpenExternalURL, m =>
			this.host.open(m.payload)
		);

		this.sender.match<M.ShowMessage>(M.MessageType.ShowMessage, m =>
			this.host.showMessage(m.payload)
		);

		this.sender.match<M.Save>(M.MessageType.Save, async m => {
			if (!m.payload || !m.payload.publish) {
				return;
			}

			const project = this.store.getProject();

			if (!project) {
				return;
			}

			const serializeResult = await Persistence.serialize(project);

			// TODO: error handling
			if (serializeResult.state !== Types.PersistenceState.Success) {
				return;
			}

			await this.host.saveFile(`${project.getName()}.alva`, serializeResult.contents);
		});

		this.sender.match<M.ContextMenuRequest>(M.MessageType.ContextMenuRequest, m => {
			if (m.payload.menu === Types.ContextMenuType.ElementMenu) {
				const element = this.store.getProject().getElementById(m.payload.data.element.id);

				if (!element) {
					return;
				}

				this.host.showContextMenu({
					position: m.payload.position,
					items: ContextMenu.elementContextMenu({
						app: this.store.getApp(),
						project: this.store.getProject(),
						element
					})
				});
			}
		});

		this.sender.match<M.ExportHtmlProject>(M.MessageType.ExportHtmlProject, async m => {
			const project = this.store.getProject();

			if (project.getId() !== m.payload.projectId) {
				return;
			}

			const name = m.payload.path ? Path.basename(m.payload.path) : `${project.getName()}.html`;
			await this.host.download(
				name,
				`http://localhost:${this.store.getServerPort()}/project/export/${project.getId()}`
			);
		});

		this.sender.match<M.Reload>(M.MessageType.Reload, async m => {
			await this.host.reload();
		});
	}
}

export class BrowserHost implements Partial<Types.Host> {
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
}
