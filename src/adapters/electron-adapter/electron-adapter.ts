import * as Electron from 'electron';
import * as Types from '../../types';
import * as M from '../../message';
import * as ContextMenu from '../../context-menu';
import { ElectronUpdater, UpdateCheckStatus } from './electron-updater';
import { ElectronMainMenu } from './electron-main-menu';
import { AlvaApp } from '../../model';
import * as uuid from 'uuid';

export interface ElectronAdapterInit {
	server: Types.AlvaServer;
}

export class ElectronAdapter {
	private server: Types.AlvaServer;

	private menu: ElectronMainMenu;
	private updater: ElectronUpdater;
	private windows: Map<string | number, Electron.BrowserWindow> = new Map();

	public constructor({ server }: ElectronAdapterInit) {
		this.server = server;
		this.menu = new ElectronMainMenu({ server });
		this.updater = new ElectronUpdater({ server });
	}

	public async start(): Promise<void> {
		const server = this.server;
		const host = this.server.host;

		Electron.app.on('window-all-closed', () => {
			if (process.platform !== 'darwin') {
				Electron.app.quit();
			}
		});

		Electron.app.on('activate', async () => {
			if (process.platform === 'darwin' && this.windows.size === 0) {
				host.createWindow(`http://localhost:${server.port}/`);
			}
		});

		server.sender.match<M.ToggleDevTools>(M.MessageType.ToggleDevTools, async () => {
			await host.toggleDevTools();
		});

		server.sender.match<M.ContextMenuRequest>(M.MessageType.ContextMenuRequest, async m => {
			if (m.payload.menu === Types.ContextMenuType.ElementMenu) {
				const project = await server.dataHost.getProject(m.payload.projectId);

				if (!project) {
					return;
				}

				const element = project.getElementById(m.payload.data.element.id);

				if (!element) {
					return;
				}

				const app = await this.getApp();

				if (!app) {
					return;
				}

				await host.showContextMenu({
					position: m.payload.position,
					items: ContextMenu.elementContextMenu({
						app,
						project,
						element
					})
				});
			}
		});

		server.sender.match<M.Undo>(M.MessageType.Undo, async () => {
			const app = await this.getApp();

			if (app && app.getHasFocusedInput()) {
				Electron.Menu.sendActionToFirstResponder('undo:');
			}
		});

		server.sender.match<M.Redo>(M.MessageType.Redo, async () => {
			const app = await this.getApp();

			if (app && app.getHasFocusedInput()) {
				Electron.Menu.sendActionToFirstResponder('redo:');
			}
		});

		server.sender.match<M.Cut>(M.MessageType.Cut, async () => {
			const app = await this.getApp();

			if (app && app.getHasFocusedInput()) {
				Electron.Menu.sendActionToFirstResponder('cut:');
			}
		});

		server.sender.match<M.Copy>(M.MessageType.Copy, async () => {
			const app = await this.getApp();

			if (app && app.getHasFocusedInput()) {
				Electron.Menu.sendActionToFirstResponder('copy:');
			}
		});

		server.sender.match<M.Paste>(M.MessageType.Paste, async () => {
			const app = await this.getApp();

			if (app && app.getHasFocusedInput()) {
				Electron.Menu.sendActionToFirstResponder('paste:');
			}
		});

		server.sender.match<M.DeleteSelected>(M.MessageType.DeleteSelected, async () => {
			const app = await this.getApp();

			if (app && app.getHasFocusedInput()) {
				Electron.Menu.sendActionToFirstResponder('delete:');
			}
		});

		server.sender.match<M.CheckForUpdatesRequest>(
			M.MessageType.CheckForUpdatesRequest,
			async () => {
				const result = await this.updater.check({ eager: true });

				if (result.status === UpdateCheckStatus.Error) {
					this.server.sender.send({
						id: uuid.v4(),
						type: M.MessageType.ShowError,
						payload: {
							message: `Could not check for updates`,
							detail: result.error.message,
							error: {
								message: result.error.message,
								stack: result.error.stack || ''
							}
						}
					});
					return;
				}

				if (result.status === UpdateCheckStatus.Available) {
					this.server.sender.send({
						id: uuid.v4(),
						type: M.MessageType.ShowMessage,
						payload: {
							message: `A new Alva version is available: ${result.info.versionInfo.version}`,
							detail: 'Do you want to download the update?',
							buttons: [
								{
									label: 'Yes',
									id: uuid.v4(),
									message: {
										id: uuid.v4(),
										type: M.MessageType.UpdateDownload,
										payload: undefined
									}
								},
								{
									label: 'No',
									id: uuid.v4()
								}
							]
						}
					});
					return;
				}

				if (result.status === UpdateCheckStatus.Unavailable) {
					this.server.sender.send({
						id: uuid.v4(),
						type: M.MessageType.ShowMessage,
						payload: {
							message: `Alva is up to date at version ${result.currentVersion.version}`,
							detail: `You may try again later. Alva also checks for updates automatically when starting.`,
							buttons: []
						}
					});
					return;
				}
			}
		);

		server.sender.match<M.UpdateDownload>(M.MessageType.UpdateDownload, async () => {
			const result = await this.updater.download();

			if (result.status === 'error') {
				this.server.sender.send({
					id: uuid.v4(),
					type: M.MessageType.ShowError,
					payload: {
						message: `Error while downloading update`,
						detail: result.error.message,
						error: {
							message: result.error.message,
							stack: result.error.stack || ''
						}
					}
				});
			}
		});

		host.createWindow(`http://localhost:${server.port}/`);

		this.menu.start();
		this.updater.start();

		this.updater.check({ eager: false });
	}

	public async getApp(): Promise<AlvaApp | undefined> {
		return this.menu.focusedApp;
	}
}
