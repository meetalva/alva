import * as Types from '../types';
import * as M from '../message';
import { MessageType as MT } from '../message';
import * as Store from '../store';
import * as Path from 'path';
import { BrowserHost } from '../hosts/browser-host';
import { BrowserDataHost } from '../hosts/browser-data-host';
import * as Matchers from '../matchers/browser';
import * as Fs from 'fs';

export class BrowserAdapter {
	public readonly sender: Types.Sender;
	public readonly store: Store.ViewStore;
	public readonly host: BrowserHost;
	public readonly dataHost: Types.DataHost;

	private constructor(init: { sender: Types.Sender; store: Store.ViewStore; fs: typeof Fs }) {
		this.sender = init.sender;
		this.store = init.store;

		this.host = new BrowserHost({
			store: this.store,
			fs: init.fs
		});

		this.dataHost = new BrowserDataHost({
			host: this.host,
			store: this.store
		});
	}

	public static fromStore(store: Store.ViewStore, ctx: { fs: typeof Fs }): BrowserAdapter {
		return new BrowserAdapter({ sender: store.getSender(), store, fs: ctx.fs });
	}

	public async start() {
		await this.host.start();
		const app = this.store.getApp();

		const sender = this.sender;
		const port = this.store.getServerPort();
		const context: Types.MatcherContext = { host: this.host, dataHost: this.dataHost, port };

		if (app.isHostType(Types.HostType.Browser)) {
			sender.match(MT.UseFileRequest, Matchers.useFileRequest(context));
			sender.match(MT.CreateNewFileRequest, Matchers.createNewFileRequest(context));
			sender.match(MT.OpenFileRequest, Matchers.openFileRequest(context));
		}

		sender.match(MT.Copy, Matchers.copy(context));
		sender.match(MT.OpenExternalURL, Matchers.openExternalUrl(context));
		sender.match(MT.OpenWindow, Matchers.openWindow(context));
		sender.match(MT.Paste, Matchers.paste(context));
		sender.match(MT.Save, Matchers.save(context, { passive: true }));
		sender.match(MT.ShowError, Matchers.showError(context));
		sender.match(MT.ShowMessage, Matchers.showMessage(context));
		sender.match(MT.ContextMenuRequest, Matchers.showContextMenu(context));

		this.sender.match<M.ExportHtmlProject>(MT.ExportHtmlProject, async m => {
			const senders = m.sender ? m.sender : [];

			if (!senders.includes(this.sender.id)) {
				return;
			}

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

		this.sender.match<M.Reload>(MT.Reload, m => {
			const senders = m.sender ? m.sender : [];

			if (senders.includes(this.sender.id)) {
				this.host.reload();
			}
		});
	}
}
