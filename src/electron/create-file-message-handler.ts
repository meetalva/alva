import * as Fs from 'fs';
import * as Message from '../message';
import * as MimeTypes from 'mime-types';
import * as Model from '../model';
import { Persistence, PersistenceState } from '../persistence';
import { showOpenDialog } from './show-open-dialog';
import { showSaveDialog } from './show-save-dialog';
import * as Types from '../types';
import * as Util from 'util';

import {
	ServerMessageHandlerContext,
	ServerMessageHandlerInjection
} from './create-server-message-handler';

const readFile = Util.promisify(Fs.readFile);

export async function createFileMessageHandler(
	ctx: ServerMessageHandlerContext,
	injection: ServerMessageHandlerInjection
): Promise<(message: Message.Message) => Promise<void>> {
	return async function fileMessageHandler(message: Message.Message): Promise<void> {
		switch (message.type) {
			case Message.MessageType.CreateNewFileRequest: {
				const path = await showSaveDialog({
					title: 'Create New Alva File',
					defaultPath: 'Untitled Project.alva',
					filters: [
						{
							name: 'Alva File',
							extensions: ['alva']
						}
					]
				});

				if (path) {
					const project = Model.Project.create({
						name: 'Untitled Project',
						path
					});

					await Persistence.persist(path, project);
					injection.ephemeralStore.setProjectPath(path);

					injection.sender.send({
						type: Message.MessageType.CreateNewFileResponse,
						id: message.id,
						payload: {
							path,
							contents: project.toJSON(),
							status: Types.ProjectPayloadStatus.Ok
						}
					});
				}
				break;
			}
			case Message.MessageType.OpenFileRequest: {
				const path = await getPath(message.payload);
				const silent = message.payload ? message.payload.silent : false;

				if (!path) {
					return;
				}

				const projectResult = await Persistence.read<Types.SavedProject>(path);

				if (projectResult.state === PersistenceState.Error) {
					if (!silent) {
						injection.sender.send({
							type: Message.MessageType.ShowError,
							id: message.id,
							payload: {
								message: [projectResult.error.message].join('\n'),
								stack: projectResult.error.stack || ''
							}
						});
					}

					return injection.sender.send({
						type: Message.MessageType.OpenFileResponse,
						id: message.id,
						payload: { error: projectResult.error, status: Types.ProjectPayloadStatus.Error }
					});
				}

				const savedProject = projectResult.contents;
				const project = savedProject as Types.SerializedProject;

				if (typeof project === 'object') {
					project.path = path;
				}

				injection.sender.send({
					type: Message.MessageType.OpenFileResponse,
					id: message.id,
					payload: { path, contents: project, status: Types.ProjectPayloadStatus.Ok }
				});

				injection.ephemeralStore.setProjectPath(path);

				break;
			}
			case Message.MessageType.AssetReadRequest: {
				const paths = await showOpenDialog({
					title: 'Select an image',
					properties: ['openFile']
				});

				if (!paths) {
					return;
				}

				const path = paths[0];

				if (!path) {
					return;
				}

				// TODO: Handle errors
				const content = await readFile(path);
				const mimeType = MimeTypes.lookup(path) || 'application/octet-stream';

				injection.sender.send({
					type: Message.MessageType.AssetReadResponse,
					id: message.id,
					payload: `data:${mimeType};base64,${content.toString('base64')}`
				});

				break;
			}
			case Message.MessageType.Save: {
				const project = Model.Project.from(message.payload.project);

				project.setPath(message.payload.path);
				injection.ephemeralStore.setProjectPath(project.getPath());

				await Persistence.persist(project.getPath(), project);
			}
		}
	};
}

const getPath = async (payload?: { path: string }): Promise<string | undefined> => {
	if (payload) {
		return payload.path;
	}

	const paths = await showOpenDialog({
		title: 'Open Alva File',
		properties: ['openFile'],
		filters: [
			{
				name: 'Alva File',
				extensions: ['alva']
			}
		]
	});

	return Array.isArray(paths) ? paths[0] : undefined;
};
