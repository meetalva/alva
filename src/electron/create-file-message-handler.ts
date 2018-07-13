import * as Fs from 'fs';
import * as Message from '../message';
import * as MimeTypes from 'mime-types';
import * as Model from '../model';
import { Persistence } from '../persistence';
import { readProjectOrError } from './read-project-or-error';
import { showOpenDialog } from './show-open-dialog';
import { showSaveDialog } from './show-save-dialog';
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
							contents: project.toJSON()
						}
					});
				}
				break;
			}
			case Message.MessageType.OpenFileRequest: {
				const path = await getPath(message.payload);

				if (!path) {
					return;
				}

				// tslint:disable-next-line:no-any
				const project = (await readProjectOrError(path)) as any;

				if (!project) {
					return;
				}

				if (typeof project === 'object') {
					project.path = path;
				}

				injection.sender.send({
					type: Message.MessageType.OpenFileResponse,
					id: message.id,
					payload: { path, contents: project }
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
