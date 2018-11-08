import * as Message from '../../message';
import * as Model from '../../model';
import * as Types from '../../types';
import { Persistence } from '../../persistence';

export function openFileRequest(
	server: Types.AlvaServer
): (message: Message.OpenFileRequest) => Promise<void> {
	return async message => {
		const suggestedPath = message.payload ? message.payload.path : undefined;
		const selectedPath = await server.host.selectFile(suggestedPath);
		const silent = message.payload ? message.payload.silent : false;

		if (!selectedPath) {
			return;
		}

		const projectResult = await Persistence.read<Types.SavedProject>(selectedPath);

		if (projectResult.state === Types.PersistenceState.Error) {
			if (!silent) {
				server.sender.send({
					type: Message.MessageType.ShowError,
					id: message.id,
					payload: {
						message: [projectResult.error.message].join('\n'),
						stack: projectResult.error.stack || ''
					}
				});
			}

			return server.sender.send({
				type: Message.MessageType.OpenFileResponse,
				id: message.id,
				payload: { error: projectResult.error, status: Types.ProjectPayloadStatus.Error }
			});
		}

		const savedProject = projectResult.contents;
		const project = savedProject as Types.SerializedProject;

		if (typeof project === 'object') {
			project.path = selectedPath;
		}

		server.dataHost.addProject(Model.Project.from(project));

		server.sender.send({
			type: Message.MessageType.OpenFileResponse,
			id: message.id,
			payload: { path: selectedPath, contents: project, status: Types.ProjectPayloadStatus.Ok }
		});
	};
}
