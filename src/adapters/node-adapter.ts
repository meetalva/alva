import * as Types from '../types';
import * as Matchers from '../matchers';
import { MessageType as M } from '../message';

export class NodeAdapter {
	private host: Types.Host;
	private dataHost: Types.DataHost;
	private port: number;

	public constructor(init: { server: Types.AlvaServer }) {
		this.host = init.server.host;
		this.dataHost = init.server.dataHost;
		this.port = init.server.port;
	}

	public async start(): Promise<void> {
		const sender = await this.host.getSender();
		const context = { dataHost: this.dataHost, host: this.host, port: this.port };

		sender.match(M.ConnectPatternLibraryRequest, Matchers.connectPatternLibrary(context));
		sender.match(M.Copy, Matchers.copy(context));
		sender.match(M.Cut, Matchers.copy(context));
		sender.match(M.CreateNewFileRequest, Matchers.createNewFileRequest(context));
		sender.match(M.OpenExternalURL, Matchers.openExternalUrl(context));
		sender.match(M.OpenFileRequest, Matchers.openFileRequest(context));
		sender.match(M.OpenWindow, Matchers.openWindow(context));
		sender.match(M.Paste, Matchers.paste(context));
		sender.match(M.Save, Matchers.save(context, { passive: false }));
		sender.match(M.SaveAs, Matchers.saveAs(context, { passive: false }));
		sender.match(M.ShowError, Matchers.showError(context));
		sender.match(M.ShowMessage, Matchers.showMessage(context));
		sender.match(M.UseFileRequest, Matchers.useFileRequest(context));
		sender.match(M.ContextMenuRequest, Matchers.showContextMenu(context));
	}
}
