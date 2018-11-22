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
						stack: projectResult.error.stack || ''
					}
				});
			}

			return;
		}

		const draftPath = await server.host.resolveFrom(Types.HostBase.AppData, `${uuid.v4()}.alva`);
		const draftProject = Model.Project.from(projectResult.contents);
		draftProject.setPath(draftPath);
		draftProject.setId(
			Buffer.from([draftProject.getId(), draftPath].join(':'), 'utf-8').toString('base64')
		);

		await server.host.mkdir(Path.dirname(draftPath));
		await server.host.writeFile(draftPath, JSON.stringify(draftProject.toDisk()));
		await server.dataHost.addProject(draftProject);

		draftProject.sync(server.sender);

		return sender.send({
			type: Message.MessageType.UseFileResponse,
			appId,
			id: message.id,
			transaction: message.transaction,
			sender: message.sender,
			payload: {
				path: draftProject.getPath(),
				contents: draftProject.toJSON(),
				status: Types.ProjectPayloadStatus.Ok
			}
		});
	};
}
