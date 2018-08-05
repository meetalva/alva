import * as Electron from 'electron';
import * as Message from '../message';
import * as uuid from 'uuid';
import { checkForUpdates } from './auto-updater';
import { showError } from './show-error';
import { requestAppSafely } from './request-app';
import { showContextMenu } from './show-context-menu';
import { showMainMenu } from './show-main-menu';
import * as Types from '../types';

import {
	ServerMessageHandlerContext,
	ServerMessageHandlerInjection
} from './create-server-message-handler';

export async function createAppMessageHandler(
	ctx: ServerMessageHandlerContext,
	injection: ServerMessageHandlerInjection
): Promise<(message: Message.Message) => Promise<void>> {
	return async function appMessageHandler(message: Message.Message): Promise<void> {
		switch (message.type) {
			case Message.MessageType.CheckForUpdatesRequest: {
				if (ctx.win) {
					checkForUpdates(ctx.win, true);
				}
				break;
			}
			case Message.MessageType.AppLoaded: {
				const pathToOpen = await injection.ephemeralStore.getProjectPath();

				if (!pathToOpen) {
					return injection.sender.send({
						id: uuid.v4(),
						type: Message.MessageType.StartApp,
						payload: {
							app: undefined,
							port: ctx.port as number
						}
					});
				}

				const projectResponse = await injection.sender.request<
					Message.OpenFileRequestResponsePair
				>(
					{
						id: uuid.v4(),
						type: Message.MessageType.OpenFileRequest,
						payload: pathToOpen ? { path: pathToOpen, silent: true } : undefined
					},
					Message.MessageType.OpenFileResponse
				);

				if (projectResponse.payload.status === Types.ProjectPayloadStatus.Error) {
					injection.ephemeralStore.clearProjectPath();

					return injection.sender.send({
						id: uuid.v4(),
						type: Message.MessageType.StartApp,
						payload: {
							app: undefined,
							port: ctx.port as number
						}
					});
				}

				return injection.sender.send({
					id: uuid.v4(),
					type: Message.MessageType.StartApp,
					payload: {
						app: await injection.ephemeralStore.getAppState(),
						port: ctx.port as number
					}
				});
			}
			case Message.MessageType.Reload: {
				injection.emitter.emit('reload', message.payload || {});
				break;
			}
			case Message.MessageType.Maximize: {
				if (ctx.win) {
					ctx.win.isMaximized() ? ctx.win.unmaximize() : ctx.win.maximize();
				}
				break;
			}
			case Message.MessageType.ShowError: {
				const error = new Error(message.payload.message);
				error.stack = message.payload.stack;
				showError(error);
				break;
			}
			case Message.MessageType.OpenExternalURL: {
				Electron.shell.openExternal(message.payload);
				break;
			}
			case Message.MessageType.ContextMenuRequest: {
				showContextMenu(message.payload, { sender: injection.sender });
				break;
			}
			case Message.MessageType.ChangeApp: {
				/* injection.ephemeralStore.setAppState(message.payload.app);

				showMainMenu(
					{ app: message.payload.app, project: project ? project.toJSON() : undefined },
					{ sender: injection.sender }
				); */

				break;
			}
			case Message.MessageType.ChangeProject: {
				const app = await requestAppSafely(injection.sender);

				if (!app) {
					return;
				}

				showMainMenu(
					{ app: app.toJSON(), project: message.payload.project },
					{ sender: injection.sender }
				);
			}
		}
	};
}
