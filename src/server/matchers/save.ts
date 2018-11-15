import * as Message from '../../message';
import * as Types from '../../types';
import { Persistence } from '../../persistence';
import * as Path from 'path';

export function save(server: Types.AlvaServer): (message: Message.Save) => Promise<void> {
	return async message => {
		const project = await server.dataHost.getProject(message.payload.projectId);

		if (!project) {
			return;
		}

		const targetPath = !message.payload.publish
			? project.getPath()
			: undefined /*await getSelectedPath() */;

		if (!targetPath) {
			return;
		}

		const serializeResult = await Persistence.serialize(project);

		// TODO: error handling
		if (serializeResult.state !== Types.PersistenceState.Success) {
			return;
		}

		// TODO: update memory data to reflect new path
		project.setPath(targetPath);
		project.setDraft(project.getDraft() ? !message.payload.publish : false);

		await server.host.mkdir(Path.dirname(targetPath));
		await server.host.writeFile(targetPath, serializeResult.contents);
	};
}
