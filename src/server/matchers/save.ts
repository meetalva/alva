import * as Message from '../../message';
import * as Types from '../../types';
import { Persistence } from '../../persistence';
import * as Path from 'path';
import * as uuid from 'uuid';

export function save(server: Types.AlvaServer): (message: Message.Save) => Promise<void> {
	return async message => {
		const app = await server.host.getApp();
		const sender = app || server.sender;
		const appId = message.appId || (app ? app.getId() : undefined);
		const project = await server.dataHost.getProject(message.payload.projectId);

		if (!project) {
			return;
		}

		const name = project.getName() !== project.toJSON().id ? project.getName() : 'New Project';

		const targetPath = !message.payload.publish
			? project.getPath()
			: await server.host.selectSaveFile({
					title: 'Save Alva File',
					defaultPath: `${name}.alva`,
					filters: [
						{
							name: 'Alva File',
							extensions: ['alva']
						}
					]
			  });

		if (!targetPath) {
			return;
		}

		const serializeResult = await Persistence.serialize(project);

		if (serializeResult.state !== Types.PersistenceState.Success) {
			sender.send({
				appId,
				type: Message.MessageType.ShowError,
				transaction: message.transaction,
				id: message.id,
				payload: {
					message: `Sorry, we had trouble writing this project to ${targetPath}`,
					detail: `It failed with: ${serializeResult.error.message}`,
					error: {
						message: serializeResult.error.message,
						stack: serializeResult.error.stack || ''
					}
				}
			});

			return;
		}

		project.setPath(targetPath);
		project.setDraft(project.getDraft() ? !message.payload.publish : false);

		if (!project.getDraft()) {
			project.setName(Path.basename(targetPath, Path.extname(targetPath)));
		}

		server.dataHost.addProject(project);
		project.sync(server.sender);

		try {
			await server.host.mkdir(Path.dirname(targetPath));
			await server.host.writeFile(targetPath, serializeResult.contents);

			sender.send({
				appId,
				type: Message.MessageType.SaveResult,
				transaction: message.transaction,
				id: uuid.v4(),
				payload: {
					previous: message.payload.projectId,
					project: project.toJSON()
				}
			});
		} catch (err) {
			sender.send({
				appId,
				type: Message.MessageType.ShowError,
				transaction: message.transaction,
				id: message.id,
				payload: {
					message: `Sorry, we had trouble writing this project to ${targetPath}`,
					detail: `It failed with: ${err.message}`,
					error: {
						message: err.message,
						stack: err.stack || ''
					}
				}
			});
		}
	};
}
