import * as Electron from 'electron';
import * as Types from '../../types';
import * as M from '../../message';
import * as Matchers from '../../matchers';
import { MessageType as MT } from '../../message';
import * as ContextMenu from '../../context-menu';
import { ElectronUpdater } from './electron-updater';
import { ElectronMainMenu } from './electron-main-menu';
import { AlvaApp, Project } from '../../model';
import * as Serde from '../../sender/serde';
import * as uuid from 'uuid';
import * as Url from 'url';

const throat = require('throat');

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

	public async start(opts?: { filePath?: string }): Promise<void> {
		const server = this.server;
		const sender = this.server.sender;
		const host = this.server.host;
		const dataHost = this.server.dataHost;
		const context = { dataHost, host, location: server.location };

		Electron.app.on('window-all-closed', () => {
			if (process.platform !== 'darwin') {
				Electron.app.quit();
			}
		});

		Electron.app.on('activate', async () => {
			if (process.platform === 'darwin' && this.windows.size === 0) {
				const win = await host.createWindow(server.location.origin);
				this.addWindow(win);
			}
		});

		Electron.app.on('open-file', async (e, path) => {
			e.preventDefault();

			const projectWindows = await this.getProjectWindows();
			const projectWindow = projectWindows.find(({ project }) => project.getPath() === path);

			if (projectWindow) {
				projectWindow.window.show();
				projectWindow.window.focus();
			} else {
				this.server.sender.send({
					type: MT.OpenFileRequest,
					id: uuid.v4(),
					payload: {
						path,
						replace: false
					}
				});
			}
		});

		sender.match<M.ConnectPatternLibraryRequest>(
			MT.ConnectPatternLibraryRequest,
			Matchers.connectPatternLibrary(context)
		);
		sender.match<M.UpdatePatternLibraryRequest>(
			MT.UpdatePatternLibraryRequest,
			Matchers.updatePatternLibrary(context)
		);
		sender.match<M.Copy>(MT.Copy, Matchers.copy(context));
		sender.match<M.Cut>(MT.Cut, Matchers.cut(context));
		sender.match<M.CreateNewFileRequest>(
			MT.CreateNewFileRequest,
			Matchers.createNewFileRequest(context)
		);
		sender.match<M.ExportHtmlProject>(MT.ExportHtmlProject, Matchers.exportHtmlProject(context));
		sender.match<M.OpenExternalURL>(MT.OpenExternalURL, Matchers.openExternalUrl(context));
		sender.match<M.OpenFileRequest>(MT.OpenFileRequest, Matchers.openFileRequest(context));
		sender.match<M.OpenWindow>(MT.OpenWindow, Matchers.openWindow(context));
		sender.match<M.Paste>(MT.Paste, Matchers.paste(context));
		sender.match<M.Save>(MT.Save, Matchers.save(context, { passive: false }));
		sender.match<M.SaveAs>(MT.SaveAs, Matchers.saveAs(context, { passive: false }));
		sender.match<M.ShowError>(MT.ShowError, Matchers.showError(context));
		sender.match<M.ShowMessage>(MT.ShowMessage, Matchers.showMessage(context));
		sender.match<M.UseFileRequest>(MT.UseFileRequest, Matchers.useFileRequest(context));
		sender.match<M.ContextMenuRequest>(MT.ContextMenuRequest, Matchers.showContextMenu(context));
		sender.match<M.ChangeApp>(MT.ChangeApp, Matchers.addApp(context));
		sender.match<M.AssetReadRequest>(MT.AssetReadRequest, Matchers.openAsset(context));
		sender.match<M.ShowUpdateDetails>(MT.ShowUpdateDetails, Matchers.showUpdateDetails(context));

		server.sender.match<M.CheckForUpdatesRequest>(
			M.MessageType.CheckForUpdatesRequest,
			throat(1, async () => {
				const check = await this.updater.check({ eager: false });

				if (check.status === Types.UpdateCheckStatus.Available) {
					const result = await this.updater.download();

					if (result.status === 'error') {
						host.log(
							`Error while downloading update ${check.info.version}: ${result.error.message}`
						);
						host.log(result.error);
						return;
					}

					this.server.sender.send({
						id: uuid.v4(),
						type: M.MessageType.UpdateDownloaded,
						payload: check.info
					});
				}
			})
		);

		server.sender.match<M.UpdateDownloaded>(M.MessageType.UpdateDownloaded, async m => {
			await dataHost.setUpdate(m.payload);
		});

		server.sender.match<M.InstallUpdate>(M.MessageType.InstallUpdate, async m => {
			await dataHost.removeUpdate();
			this.updater.install();
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

		server.sender.match<M.Paste>(M.MessageType.Paste, async m => {
			const app = await host.getApp(m.appId || '');

			if (!app) {
				host.log(`paste: received message without resolveable app: ${m}`);
				return;
			}

			const contents = await host.readClipboard();

			if (!contents) {
				host.log(`paste: no contents`);
				return;
			}

			const message = Serde.deserialize(contents);

			// Trigger the default behaviour if the clipboard
			// has no Alva message and an input is focused
			if (!message && app.getHasFocusedInput()) {
				host.log(`paste: redirecting to input`);
				Electron.Menu.sendActionToFirstResponder('paste:');
				return;
			}

			if (!message || message.type !== M.MessageType.Clipboard) {
				host.log(`paste: clipboard message is no clipboard message`);
				return;
			}
		});

		server.sender.match<M.DeleteSelected>(M.MessageType.DeleteSelected, async () => {
			const app = await this.getApp();

			if (app && app.getHasFocusedInput()) {
				Electron.Menu.sendActionToFirstResponder('delete:');
			}
		});

		const useFileResponse = Matchers.useFileResponse(context);

		server.sender.match<M.UseFileResponse>(MT.UseFileResponse, async m => {
			if (
				this.windows.size > 0 ||
				m.payload.project.status === Types.ProjectPayloadStatus.Error ||
				!m.payload.replace
			) {
				return useFileResponse(m);
			}

			const project = Project.from((m.payload.project as Types.ProjectPayloadSuccess).contents);
			const newWindow = await host.createWindow(
				`${server.location.origin}/project/${project.getId()}`
			);
			this.addWindow(newWindow);
		});

		server.sender.match<M.Maximize>(MT.Maximize, async m => {
			const win = await this.getAppWindow(m.appId || uuid.v4());

			if (win) {
				win.maximize();
			}
		});

		// Open the splash screen when starting without file
		if (!opts || !opts.filePath) {
			const win = await host.createWindow(server.location.origin);
			this.addWindow(win);
		} else {
			this.server.sender.send({
				type: MT.OpenFileRequest,
				id: uuid.v4(),
				payload: {
					path: opts.filePath,
					replace: false
				}
			});
		}

		this.menu.start();
		this.updater.start();
	}

	public async getApp(): Promise<AlvaApp | undefined> {
		return this.menu.focusedApp;
	}

	public async getAppWindows(): Promise<Map<string, Electron.BrowserWindow>> {
		return new Map(
			Electron.BrowserWindow.getAllWindows()
				.map(win => {
					const parsed = Url.parse(win.webContents.getURL());

					if (!parsed.hash) {
						return;
					}

					return [parsed.hash.slice(1), win];
				})
				.filter((win): win is [string, Electron.BrowserWindow] => typeof win !== 'undefined')
		);
	}

	public async getAppWindow(appId: string): Promise<Electron.BrowserWindow | undefined> {
		return (await this.getAppWindows()).get(appId);
	}

	public addWindow(win?: Electron.BrowserWindow): void {
		if (win) {
			this.windows.set(win.id, win);

			win.on('close', () => {
				this.windows.delete(win.id);
			});
		}
	}

	public async getProjectWindows(): Promise<
		{ project: Project; window: Electron.BrowserWindow }[]
	> {
		return (await Promise.all(
			Array.from((await this.getAppWindows()).values()).map(async win => {
				const parsed = Url.parse(win.webContents.getURL());
				if (!parsed.pathname || !parsed.pathname.startsWith('/project')) {
					return;
				}

				const fragments = parsed.pathname.split('/').filter(Boolean);
				const id = fragments[fragments.length - 1];

				return {
					window: win,
					project: await this.server.dataHost.getProject(id)
				};
			})
		)).filter(
			(item): item is { window: Electron.BrowserWindow; project: Project } =>
				typeof item !== 'undefined' && typeof item.project !== 'undefined'
		);
	}
}
