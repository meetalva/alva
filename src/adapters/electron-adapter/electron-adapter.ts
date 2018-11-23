import * as Electron from 'electron';
import * as Types from '../../types';
import * as M from '../../message';
import * as ContextMenu from '../../context-menu';
import { ElectronMainMenu } from './electron-main-menu';
import { AlvaApp } from '../../model';

export interface ElectronAdapterInit {
	server: Types.AlvaServer;
}

export class ElectronAdapter {
	private server: Types.AlvaServer;

	private menu: ElectronMainMenu;
	private windows: Map<string | number, Electron.BrowserWindow> = new Map();

	public constructor({ server }: ElectronAdapterInit) {
		this.server = server;
		this.menu = new ElectronMainMenu({ server });
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

		host.createWindow(`http://localhost:${server.port}/`);

		this.menu.start();
	}

	public async getApp(): Promise<AlvaApp | undefined> {
		return this.menu.focusedApp;
	}
}
