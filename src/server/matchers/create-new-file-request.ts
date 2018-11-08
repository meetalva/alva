import * as Path from 'path';
import * as Message from '../../message';
import * as Model from '../../model';
import * as Types from '../../types';
import * as uuid from 'uuid';

export function createNewFileRequest(
	server: Types.AlvaServer
): (message: Message.CreateNewFileRequest) => Promise<void> {
	return async message => {
		const draftPath = await server.host.resolveFrom(Types.HostBase.AppData, `${uuid.v4()}.alva`);

		const drafProject = Model.Project.create({
			draft: true,
			name: 'New Project',
			path: draftPath
		});

		await server.host.mkdir(Path.dirname(draftPath));
		await server.host.writeFile(draftPath, JSON.stringify(drafProject.toDisk()));

		await server.dataHost.addProject(drafProject);

		// TODO: Scope sync to projects by id
		drafProject.sync(server.sender);

		server.sender.send({
			id: message.id,
			type: Message.MessageType.CreateNewFileResponse,
			payload: {
				path: draftPath,
				contents: drafProject.toJSON(),
				status: Types.ProjectPayloadStatus.Ok
			}
		});
	};
}
