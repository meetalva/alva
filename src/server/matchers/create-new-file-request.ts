import * as Message from '../../message';
import * as Model from '../../model';
import * as Types from '../../types';
import { Persistence } from '../../persistence';

export function createNewFileRequest(
	server: Types.AlvaServer
): (message: Message.CreateNewFileRequest) => Promise<void> {
	return async message => {
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
				type: Message.MessageType.UseFileRequest,
				id: message.id,
				transaction: message.transaction,
				payload: {
					silent: false,
					contents: serializeResult.contents
				}
			},
			{
				type: Message.MessageType.UseFileResponse
			}
		);

		server.sender.send({
			id: message.id,
			type: Message.MessageType.CreateNewFileResponse,
			payload: response.payload
		});
	};
}
