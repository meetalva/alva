import * as Electron from 'electron';
import * as Fs from 'fs';
import * as Os from 'os';
import * as Path from 'path';
import * as Message from '../message';
import * as Model from '../model';
import * as uuid from 'uuid';
import { checkForUpdates } from './auto-updater';
import { showError } from './show-error';
import { showContextMenu } from './show-context-menu';
import * as Types from '../types';
import { showDiscardDialog, DiscardDialogResult } from './show-discard-dialog';

import {
	ServerMessageHandlerContext,
	ServerMessageHandlerInjection
} from './create-server-message-handler';

export async function createAppMessageHandler(
	ctx: ServerMessageHandlerContext,
	injection: ServerMessageHandlerInjection
): Promise<(message: Message.Message) => Promise<void>> {
	// tslint:disable-next-line:cyclomatic-complexity
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
				showContextMenu(message.payload, { sender: injection.sender, project: ctx.project });
				break;
			}
			case Message.MessageType.ChangeApp: {
				// TODO: Replace with app.sync
				ctx.app = Model.AlvaApp.from(message.payload.app);
				break;
			}
			case Message.MessageType.WindowClose: {
				if (!ctx.project || !ctx.project.getDraft()) {
					if (ctx.win) {
						ctx.win.destroy();
					}
					return;
				}

				const result = await showDiscardDialog(ctx.project);

				switch (result) {
					case DiscardDialogResult.Discard:
						injection.ephemeralStore.clear();
						ctx.project = undefined;
						if (ctx.win) {
							ctx.win.hide();
						}
						break;
					case DiscardDialogResult.Save:
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

						// Give the user some time to realize we saved
						setTimeout(() => {
							ctx.win && ctx.win.hide();
							ctx.project = undefined;
						}, 1000);
						break;
					case DiscardDialogResult.Cancel:
					default:
						return;
				}
				break;
			}
			case Message.MessageType.ChromeScreenShot: {
				if (!ctx.win) {
					return;
				}

				ctx.win.webContents.printToPDF(
					{
						marginsType: 1,
						printBackground: true,
						pageSize: {
							// px => micron
							width: message.payload.width * 265,
							height: message.payload.height * 265
							// tslint:disable-next-line:no-any
						} as any
					},
					(err, data) => {
						if (err) {
							return console.error(err.message);
						}

						const targetPath = Path.join(Os.tmpdir(), `${uuid.v4()}.pdf`);

						Fs.writeFile(targetPath, data, error => {
							if (error) {
								return console.error(error);
							}

							Electron.shell.openExternal(`file://${targetPath}`);
						});
					}
				);
			}
		}
	};
}
