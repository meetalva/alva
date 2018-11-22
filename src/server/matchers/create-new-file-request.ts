import * as Message from '../../message';
import * as Model from '../../model';
import * as Types from '../../types';
import { Persistence } from '../../persistence';

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

		const response = await server.sender.transaction(
			{
				appId,
				type: Message.MessageType.UseFileRequest,
				id: message.id,
				transaction: message.transaction,
				sender: message.sender,
				payload: {
					silent: false,
					contents: serializeResult.contents
				}
			},
			{
				type: Message.MessageType.UseFileResponse
			}
		);

		sender.send({
			appId,
			id: message.id,
			type: Message.MessageType.CreateNewFileResponse,
			payload: response.payload,
			transaction: message.transaction,
			sender: message.sender
		});
	};
}
