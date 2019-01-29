import * as Types from '@meetalva/types';
import * as Matchers from '../matchers';
import * as M from '@meetalva/message';
import { MessageType as MT } from '@meetalva/message';
import * as Mobx from 'mobx';
import * as uuid from 'uuid';
import * as Model from '@meetalva/model';

export class NodeAdapter {
	private host: Types.Host<Model.AlvaApp<M.Message>, Model.Project, M.Message>;
	private dataHost: Types.DataHost<Model.Project>;
	private location: Types.Location;

	public constructor(init: {
		server: Types.AlvaServer<Model.AlvaApp<M.Message>, Model.Project, M.Message>;
	}) {
		this.host = init.server.host;
		this.dataHost = init.server.dataHost;
		this.location = init.server.location;
	}

	public async start(): Promise<void> {
		const sender = await this.host.getSender();
		const context = {
			dataHost: this.dataHost,
			host: this.host,
			location: this.location
		};

		sender.match<M.ConnectPatternLibraryRequest>(
			MT.ConnectPatternLibraryRequest,
			Matchers.connectPatternLibrary(context)
		);
		sender.match<M.UpdatePatternLibraryRequest>(
			MT.UpdatePatternLibraryRequest,
			Matchers.updatePatternLibrary(context)
		);

		sender.match<M.Copy>(MT.Copy, Matchers.copy(context));
		sender.match<M.Cut>(MT.Cut, Matchers.cut(context));
		sender.match<M.CreateNewFileRequest>(
			MT.CreateNewFileRequest,
			Matchers.createNewFileRequest(context)
		);
		sender.match<M.OpenExternalURL>(MT.OpenExternalURL, Matchers.openExternalUrl(context));
		sender.match<M.OpenFileRequest>(MT.OpenFileRequest, Matchers.openFileRequest(context));
		sender.match<M.OpenRemoteFileRequest>(
			MT.OpenRemoteFileRequest,
			Matchers.openRemoteFileRequest(context)
		);
		sender.match<M.OpenWindow>(MT.OpenWindow, Matchers.openWindow(context));
		sender.match<M.Paste>(MT.Paste, Matchers.paste(context));
		sender.match<M.Save>(MT.Save, Matchers.save(context, { passive: false }));
		sender.match<M.SaveAs>(MT.SaveAs, Matchers.saveAs(context, { passive: false }));
		sender.match<M.ShowError>(MT.ShowError, Matchers.showError(context));
		sender.match<M.ShowMessage>(MT.ShowMessage, Matchers.showMessage(context));
		sender.match<M.UseFileRequest>(MT.UseFileRequest, Matchers.useFileRequest(context));
		sender.match<M.UseFileResponse>(MT.UseFileResponse, Matchers.useFileResponse(context));
		sender.match<M.ContextMenuRequest>(MT.ContextMenuRequest, Matchers.showContextMenu(context));
		sender.match<M.ChangeApp>(MT.ChangeApp, Matchers.addApp(context));

		sender.match<M.SaveResult>(MT.SaveResult, () => this.dataHost.checkProjects());
		sender.match<M.UseFileResponse>(MT.UseFileResponse, () => this.dataHost.checkProjects());
		sender.match<M.ConnectNpmPatternLibraryRequest>(
			MT.ConnectNpmPatternLibraryRequest,
			Matchers.connectNpmPatternLibrary(context)
		);
		sender.match<M.UpdateNpmPatternLibraryRequest>(
			MT.UpdateNpmPatternLibraryRequest,
			Matchers.updateNpmPatternLibrary(context)
		);

		Mobx.autorun(async () => {
			sender.send({
				type: MT.ProjectRecordsChanged,
				id: uuid.v4(),
				payload: {
					projects: await this.dataHost.getProjects()
				}
			});
		});
	}
}
