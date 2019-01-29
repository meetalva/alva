import * as Types from '@meetalva/types';
import * as M from '../message';
import { MessageType as MT } from '../message';
import * as Store from '../store';
import { BrowserHost } from '../hosts/browser-host';
import { BrowserDataHost } from '../hosts/browser-data-host';
import * as Matchers from '../matchers/browser';
import * as Model from '../model';
import * as Fs from 'fs';
import * as uuid from 'uuid';
import * as Mobx from 'mobx';

export class BrowserAdapter {
	public readonly sender: Types.Sender<M.Message>;
	public readonly store: Store.ViewStore;
	public readonly host: BrowserHost;
	public readonly dataHost: Types.DataHost<Model.Project>;

	private constructor(init: { sender: Types.Sender<M.Message>; store: Store.ViewStore; fs?: typeof Fs }) {
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

		this.sender.setLog((dir: string, m: M.Message) => {
			console.groupCollapsed(`${dir} ${m.type}`);
			console.dir(m);
			console.groupEnd();
		});
	}

	public static fromStore(store: Store.ViewStore, { fs }: { fs?: typeof Fs }): BrowserAdapter {
		return new BrowserAdapter({ sender: store.getSender(), store, fs });
	}

	public async start() {
		await this.host.start();
		const app = this.store.getApp();
		const context: Types.MatcherContext<Model.AlvaApp<M.Message>, Model.Project, M.Message> = {
			host: this.host,
			dataHost: this.dataHost,
			location: window.location
		};

		if (app.isHostType(Types.HostType.Browser)) {
			app.send({
				type: M.MessageType.ProjectRecordsChanged,
				id: uuid.v4(),
				payload: {
					projects: await this.dataHost.getProjects()
				}
			});

			app.match<M.UseFileRequest>(MT.UseFileRequest, Matchers.useFileRequest(context));
			app.match<M.UseFileResponse>(MT.UseFileResponse, Matchers.useFileResponse(context));
			app.match<M.CreateNewFileRequest>(
				MT.CreateNewFileRequest,
				Matchers.createNewFileRequest(context)
			);
			app.match<M.OpenFileRequest>(MT.OpenFileRequest, Matchers.openFileRequest(context));
			app.match<M.OpenRemoteFileRequest>(
				MT.OpenRemoteFileRequest,
				Matchers.openRemoteFileRequest(context)
			);
		}

		app.match<M.ExportHtmlProject>(MT.ExportHtmlProject, Matchers.exportHtmlProject(context));
		app.match<M.Copy>(MT.Copy, Matchers.copy(context));
		app.match<M.Cut>(MT.Cut, Matchers.cut(context));
		app.match<M.OpenExternalURL>(MT.OpenExternalURL, Matchers.openExternalUrl(context));
		app.match<M.OpenWindow>(
			MT.OpenWindow,
			Matchers.openWindow({ ...context, location: window.location })
		);
		app.match<M.Paste>(MT.Paste, Matchers.paste(context));
		app.match<M.Save>(MT.Save, Matchers.save(context, { passive: true }));
		app.match<M.SaveAs>(MT.SaveAs, Matchers.saveAs(context, { passive: true }));
		app.match<M.ShowError>(MT.ShowError, Matchers.showError(context));
		app.match<M.ShowMessage>(MT.ShowMessage, Matchers.showMessage(context));
		app.match<M.ContextMenuRequest>(MT.ContextMenuRequest, Matchers.showContextMenu(context));
		app.match<M.ChangeApp>(MT.ChangeApp, Matchers.addApp(context));

		app.match<M.Reload>(MT.Reload, m => {
			const senders = m.sender ? m.sender : [];

			if (senders.includes(this.sender.id)) {
				this.host.reload();
			}
		});

		this.sender.match<M.SaveResult>(MT.SaveResult, () => this.dataHost.checkProjects());
		this.sender.match<M.UseFileResponse>(MT.UseFileResponse, () => this.dataHost.checkProjects());

		Mobx.autorun(async () => {
			this.sender.send({
				type: MT.ProjectRecordsChanged,
				id: uuid.v4(),
				payload: {
					projects: await this.dataHost.getProjects()
				}
			});
		});
	}
}
