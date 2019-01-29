import * as Electron from 'electron';
import * as Mobx from 'mobx';
import * as Model from '../../model';
import * as M from '../../message';
import { MessageType as MT } from '../../message';
import * as Menu from '../../menu';
import * as Types from '@meetalva/types';
import * as Url from 'url';
import uuid = require('uuid');

export class ElectronMainMenu {
	private server: Types.AlvaServer<Model.AlvaApp<M.Message>, Model.Project, M.Message>;

	@Mobx.observable private focusedApp: Model.AlvaApp<M.Message> | undefined;
	@Mobx.observable private focusedProject: Model.Project | undefined;

	public constructor(init: { server: Types.AlvaServer<Model.AlvaApp<M.Message>, Model.Project, M.Message>; }) {
		this.server = init.server;
	}

	public start(): void {
		Electron.app.on('browser-window-created', (_: unknown, win: Electron.BrowserWindow) => {
			win.webContents.addListener('did-navigate', () => this.onHashChange(win));
			win.webContents.addListener('did-navigate-in-page', () => this.onHashChange(win));
		});

		Electron.app.on('browser-window-focus', (_: unknown, win: Electron.BrowserWindow) => {
			this.onHashChange(win);
		});

		this.server.sender.match<M.ChangeApp>(M.MessageType.ChangeApp, m => {
			this.focusedApp = Model.AlvaApp.from(m.payload.app, { sender: this.server.sender });
		});

		Mobx.autorun(async () => {
			this.render({
				app: this.focusedApp,
				project: this.focusedProject
			});
		});
	}

	private async onHashChange(win: Electron.BrowserWindow) {
		const parsed = Url.parse(win.webContents.getURL());

		if (!parsed.hash) {
			return;
		}

		if (!parsed.pathname || !parsed.pathname.startsWith('/project')) {
			this.focusedProject = undefined;
			return;
		}

		const appId = parsed.hash.slice(1);

		if (!this.focusedApp || this.focusedApp.getId() !== appId) {
			const response = await this.server.sender.transaction<M.AppRequest, M.AppResponse>(
				{
					id: uuid.v4(),
					appId,
					type: MT.AppRequest,
					payload: undefined
				},
				{ type: MT.AppResponse }
			);

			this.focusedApp = Model.AlvaApp.from(response.payload.app, { sender: this.server.sender });
		}

		const fragments = parsed.pathname.split('/').filter(Boolean);
		const id = fragments[fragments.length - 1];
		this.focusedProject = await this.server.dataHost.getProject(id);
	}

	private render(ctx: {
		app: Model.AlvaApp<M.Message> | undefined;
		project: Model.Project | undefined;
	}): void {
		const toElectronAction = (item: Types.MenuItem<Model.AlvaApp<M.Message>, M.Message>): Electron.MenuItemConstructorOptions[] => {
			if (typeof (item as any).click === 'function') {
				const actionable = item as Types.ActionableMenuItem<Model.AlvaApp<M.Message>, M.Message>;
				const onClick = actionable.click!;
				actionable.click = () => {
					if (!this.focusedApp) {
						return;
					}
					onClick(this.focusedApp);
				};
			}

			if (Array.isArray((item as any).submenu)) {
				const nested = item as Types.NestedMenuItem<Model.AlvaApp<M.Message>, M.Message>;
				(nested as any).submenu = nested.submenu.map(m => toElectronAction(m));
			}

			return item as any;
		};

		const template = [
			Menu.appMenu(ctx),
			Menu.fileMenu(ctx),
			Menu.editMenu(ctx),
			Menu.viewMenu(ctx),
			Menu.windowMenu(ctx),
			Menu.helpMenu(ctx)
		].map(toElectronAction);

		const menu = Electron.Menu.buildFromTemplate(template as any);
		Electron.Menu.setApplicationMenu(menu);
	}

	public setApp(app: Model.AlvaApp<M.Message> | undefined) {
		return (this.focusedApp = app);
	}

	public getApp(): Model.AlvaApp<M.Message> | undefined {
		return this.focusedApp;
	}
}
