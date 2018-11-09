import * as Fs from 'fs';
import * as Message from '../message';
import * as MimeTypes from 'mime-types';
import * as Model from '../model';
import * as Path from 'path';
import { Persistence } from '../persistence';
import { showOpenDialog } from './show-open-dialog';
import { showSaveDialog } from './show-save-dialog';
import * as Types from '../types';
import * as Util from 'util';
import * as uuid from 'uuid';
// import { showDiscardDialog, DiscardDialogResult } from './show-discard-dialog';
// import { showError } from './show-error';

import {
	ServerMessageHandlerContext,
	ServerMessageHandlerInjection
} from './create-server-message-handler';
// import { inject } from 'mobx-react';

const isPathInside = require('is-path-inside');
const readFile = Util.promisify(Fs.readFile);

export async function createFileMessageHandler(
	ctx: ServerMessageHandlerContext,
	injection: ServerMessageHandlerInjection
): Promise<(message: Message.Message) => Promise<void>> {
	// tslint:disable-next-line:cyclomatic-complexity
	return async function fileMessageHandler(message: Message.Message): Promise<void> {
		switch (message.type) {
			case Message.MessageType.CreateNewFileRequest: {
				const draftPath = Path.join(ctx.appPath, `${uuid.v4()}.alva`);

				const drafProject = Model.Project.create({
					draft: true,
					name: 'New Project',
					path: draftPath
				});

				await Persistence.persist(draftPath, drafProject);

				injection.ephemeralStore.add(drafProject);

				// injection.sender.send({
				// 	type: Message.MessageType.CreateNewFileResponse,
				// 	id: message.id,
				// 	payload: {
				// 		path: draftPath,
				// 		contents: drafProject.toJSON(),
				// 		status: Types.ProjectPayloadStatus.Ok
				// 	}
				// });

				injection.sender.send({
					type: Message.MessageType.WindowOpen,
					id: message.id,
					payload: {
						windowId: uuid.v4(),
						projectId: drafProject.getId(),
						projectPath: drafProject.getPath()
					}
				});

				break;

				// Prompt the user to save if there has been a project previously
				/* if (ctx.project && ctx.project.getDraft()) {
					const discardResult = await showDiscardDialog(ctx.project);

					if (discardResult === DiscardDialogResult.Save) {
						const saveResult = await injection.sender.transaction(
							{
								id: uuid.v4(),
								type: Message.MessageType.Save,
								payload: { publish: true }
							},
							{ type: Message.MessageType.SaveResult }
						);

						if (saveResult.payload.result === Types.PersistenceState.Error) {
							return showError(saveResult.payload.result.error);
						}
					}

					if (discardResult === DiscardDialogResult.Cancel) {
						return;
					}
				}

				const draftPath = Path.join(ctx.appPath, `${uuid.v4()}.alva`);

				ctx.project = Model.Project.create({
					draft: true,
					name: 'New Project',
					path: draftPath
				});

				await Persistence.persist(draftPath, ctx.project);
				injection.ephemeralStore.setProjectPath(draftPath);

				injection.sender.send({
					type: Message.MessageType.CreateNewFileResponse,
					id: message.id,
					payload: {
						path: draftPath,
						contents: ctx.project.toJSON(),
						status: Types.ProjectPayloadStatus.Ok
					}
				});

				break; */
			}
			case Message.MessageType.OpenFileRequest: {
				const path = await getPath(message.payload);
				const silent = message.payload ? message.payload.silent : false;

				if (!path) {
					return;
				}

				const projectResult = await Persistence.read<Types.SavedProject>(path);

				if (projectResult.state === Types.PersistenceState.Error) {
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

				ctx.project = Model.Project.from(project);

				injection.sender.send({
					type: Message.MessageType.OpenFileResponse,
					id: message.id,
					payload: { path, contents: project, status: Types.ProjectPayloadStatus.Ok }
				});

				// injection.ephemeralStore.setProjectPath(path);

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
				if (!ctx.project) {
					return;
				}

				const publish = message.payload ? message.payload.publish : false;

				const getSelectedPath = () =>
					showSaveDialog({
						title: 'Save Alva File',
						defaultPath: 'New Project.alva',
						filters: [
							{
								name: 'Alva File',
								extensions: ['alva']
							}
						]
					});

				const targetPath = !publish ? ctx.project.getPath() : await getSelectedPath();

				if (!targetPath) {
					return;
				}

				ctx.project.setPath(targetPath);
				// injection.ephemeralStore.setProjectPath(ctx.project.getPath());

				const result = await Persistence.persist(targetPath, ctx.project);

				ctx.project.setName(
					isPathInside(targetPath, ctx.appPath)
						? 'New Project'
						: Path.basename(ctx.project.getPath(), Path.extname(targetPath))
				);

				ctx.project.setDraft(ctx.project.getDraft() ? !publish : false);

				injection.sender.send({
					id: uuid.v4(),
					transaction: message.transaction,
					type: Message.MessageType.SaveResult,
					payload: {
						result,
						draft: ctx.project.getDraft(),
						name: ctx.project.getName()
					}
				});
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
