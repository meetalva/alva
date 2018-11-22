import * as Message from '../../message';
import * as Model from '../../model';
import * as Types from '../../types';
import { Persistence } from '../../persistence';
import * as uuid from 'uuid';

export function createNewFileRequest(
	server: Types.AlvaServer
): (message: Message.CreateNewFileRequest) => Promise<void> {
	return async message => {
		const app = await server.host.getApp();
		const sender = app || server.sender;
		const appId = message.appId || (app ? app.getId() : undefined);

		const draftProject = Model.Project.create({
			draft: true,
			name: 'New Project',
			path: ''
		});

		const serializeResult = await Persistence.serialize(draftProject);

		// TODO: error handling
		if (serializeResult.state !== Types.PersistenceState.Success) {
			return;
		}

		const response = await server.sender.transaction<
			Message.UseFileRequest,
			Message.UseFileResponse
		>(
			{
				appId,
				type: Message.MessageType.UseFileRequest,
				id: message.id,
				transaction: message.transaction,
				sender: message.sender,
				payload: {
					silent: false,
					replace: message.payload.replace,
					contents: serializeResult.contents
				}
			},
			{
				type: Message.MessageType.UseFileResponse
			}
		);

		if (response.payload.project.status === Types.ProjectPayloadStatus.Error) {
			const p = response.payload.project as Types.ProjectPayloadError;

			sender.send({
				appId,
				type: Message.MessageType.ShowError,
				transaction: message.transaction,
				id: message.id,
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

		const p = response.payload.project as Types.ProjectPayloadSuccess;

		if (!message.payload.replace) {
			sender.send({
				id: uuid.v4(),
				type: Message.MessageType.OpenWindow,
				payload: {
					view: Types.AlvaView.PageDetail,
					projectId: p.contents.id
				},
				transaction: message.transaction,
				sender: message.sender
			});
		}

		sender.send({
			appId,
			id: message.id,
			type: Message.MessageType.CreateNewFileResponse,
			payload: p,
			transaction: message.transaction,
			sender: message.sender
		});
	};
}
