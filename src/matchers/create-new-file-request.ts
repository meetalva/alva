import * as M from '../message';
import * as Model from '../model';
import * as T from '../types';
import { Persistence } from '../persistence';
import * as uuid from 'uuid';

export function createNewFileRequest({
	host
}: T.MatcherContext): T.Matcher<M.CreateNewFileRequest> {
	return async m => {
		const app = await host.getApp();
		const sender = app || (await host.getSender());
		const appId = m.appId || (app ? app.getId() : undefined);

		const draftProject = Model.Project.create({
			draft: true,
			name: 'New Project',
			path: ''
		});

		const serializeResult = await Persistence.serialize(draftProject);

		// TODO: error handling
		if (serializeResult.state !== T.PersistenceState.Success) {
			return;
		}

		const response = await (await host.getSender()).transaction<
			M.UseFileRequest,
			M.UseFileResponse
		>(
			{
				appId,
				type: M.MessageType.UseFileRequest,
				id: m.id,
				transaction: m.transaction,
				sender: m.sender,
				payload: {
					silent: false,
					replace: m.payload.replace,
					contents: serializeResult.contents
				}
			},
			{
				type: M.MessageType.UseFileResponse
			}
		);

		if (response.payload.project.status === T.ProjectPayloadStatus.Error) {
			const p = response.payload.project as T.ProjectPayloadError;

			sender.send({
				appId,
				type: M.MessageType.ShowError,
				transaction: m.transaction,
				id: m.id,
				payload: {
					message: [p.error.message].join('\n'),
					detail: p.error.stack || '',
					error: {
						message: p.error.message,
						stack: p.error.stack || ''
					}
				}
			});
		}

		const p = response.payload.project as T.ProjectPayloadSuccess;
		const replacement = Model.Project.from(p.contents);

		if (!m.payload.replace) {
			sender.send({
				id: uuid.v4(),
				type: M.MessageType.OpenWindow,
				payload: {
					view: T.AlvaView.PageDetail,
					projectId: replacement.getId()
				},
				transaction: m.transaction,
				sender: m.sender
			});
		}

		sender.send({
			appId,
			id: m.id,
			type: M.MessageType.CreateNewFileResponse,
			payload: p,
			transaction: m.transaction,
			sender: m.sender
		});
	};
}
