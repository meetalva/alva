import * as Types from '../types';
import { MessageType as M } from '../message';
import { ViewStore } from '../store';
import * as ContextMenu from '../context-menu';

export class HostAdapter {
	private sender: Types.Sender;
	private store: ViewStore;
	private host: BrowserHost;

	private constructor(init: { sender: Types.Sender; store: ViewStore }) {
		this.sender = init.sender;
		this.store = init.store;
		this.host = new BrowserHost();
	}

	public static fromStore(store: ViewStore): HostAdapter {
		return new HostAdapter({ sender: store.getSender(), store });
	}

	public start() {
		this.sender.match(M.OpenExternalURL, m => this.host.open(m.payload));
		this.sender.match(M.ShowMessage, m => this.host.showMessage(m.payload));
		this.sender.match(M.ContextMenuRequest, m => {
			if (m.payload.menu === Types.ContextMenuType.ElementMenu) {
				const element = this.store.getProject().getElementById(m.payload.data.element.id);

				if (!element) {
					return;
				}

				this.host.showContextMenu(
					ContextMenu.elementContextMenu({
						app: this.store.getApp(),
						project: this.store.getProject(),
						element
					})
				);
			}
		});
	}
}

export class BrowserHost implements Partial<Types.Host> {
	public async open(url: string): Promise<void> {
		window.open(url, '_blank');
	}

	public async showMessage(opts: Types.HostMessageOptions): Promise<undefined> {
		// TODO: implement custom dialogs
		alert([opts.message, opts.detail].filter(Boolean).join('\n'));
		return;
	}

	public async showContextMenu(opts: any): Promise<undefined> {
		console.log({ opts });
		return;
	}
}
