import * as Message from '../../message';
import * as Types from '../../types';
import { Persistence } from '../../persistence';
import * as uuid from 'uuid';
import * as Path from 'path';
import * as Model from '../../model';

export function useFileRequest(
	server: Types.AlvaServer
): (message: Message.UseFileRequest) => Promise<void> {
	return async message => {
		const app = await server.host.getApp();
		const sender = app || server.sender;
		const appId = message.appId || (app ? app.getId() : undefined);

		const projectResult = await Persistence.parse<Types.SerializedProject>(
			message.payload.contents
		);

		const silent =
			message.payload && typeof message.payload.silent === 'boolean'
				? message.payload.silent
				: false;

		if (projectResult.state === Types.PersistenceState.Error) {
			if (!silent) {
				sender.send({
					appId,
					type: Message.MessageType.ShowError,
					id: message.id,
					payload: {
						message: [projectResult.error.message].join('\n'),
						detail: projectResult.error.stack || '',
						error: {
							message: projectResult.error.message,
							stack: projectResult.error.stack || ''
						}
					}
				});
			}

			return;
		}

		const result = Model.Project.toResult(projectResult.contents);

		if (result.status !== 'ok') {
			sender.send({
				appId,
				type: Message.MessageType.ShowError,
				transaction: message.transaction,
				id: message.id,
				payload: {
					message: `Sorry, we had trouble reading this project`,
					detail: `Parsing it failed with: ${result.error.message}`,
					error: {
						message: result.error.message,
						stack: result.error.stack || ''
					}
				}
			});

			return;
		}

		const draftProject = result.result;

		if (!message.payload.path) {
			const draftPath = await server.host.resolveFrom(
				Types.HostBase.AppData,
				`${uuid.v4()}.alva`
			);
			draftProject.setPath(draftPath);

			await server.host.mkdir(Path.dirname(draftPath));
			await server.host.writeFile(draftPath, JSON.stringify(draftProject.toDisk()));
		} else {
			draftProject.setPath(message.payload.path);
		}

		await server.dataHost.addProject(draftProject);
		draftProject.sync(server.sender);

		return sender.send({
			type: Message.MessageType.UseFileResponse,
			appId,
			id: message.id,
			transaction: message.transaction,
			sender: message.sender,
			payload: {
				project: {
					path: draftProject.getPath(),
					contents: draftProject.toJSON(),
					status: Types.ProjectPayloadStatus.Ok
				},
				replace: message.payload.replace
			}
		});
	};
}
