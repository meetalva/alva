import * as Electron from 'electron';
import * as Mobx from 'mobx';
import * as Model from '../../model';
import * as M from '../../message';
import { MessageType as MT } from '../../message';
import * as Menu from '../../menu';
import * as Types from '../../types';
import * as Url from 'url';
import uuid = require('uuid');

export class ElectronMainMenu {
	private server: Types.AlvaServer;

	@Mobx.observable private focusedApp: Model.AlvaApp | undefined;
	@Mobx.observable private focusedProject: Model.Project | undefined;

	public constructor(init: { server: Types.AlvaServer }) {
		this.server = init.server;
	}

	public start(): void {
		Electron.app.on('browser-window-focus', (_: unknown, win: Electron.BrowserWindow) => {
			this.onWindowFocus(win);
		});

		Electron.app.on('browser-window-created', (_: unknown, win: Electron.BrowserWindow) => {
			console.log(win.isFocused());
			if (win.isFocused()) {
				this.onWindowFocus(win);
			}
		});

		Electron.app.on('browser-window-blur', (_: unknown, win: Electron.BrowserWindow) => {
			this.onWindowBlur(win);
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

	private async onWindowFocus(win: Electron.BrowserWindow): Promise<void> {
		const parsed = Url.parse(win.webContents.getURL());

		if (!parsed.hash) {
			return;
		}

		const response = await this.server.sender.transaction<M.AppRequest, M.AppResponse>(
			{
				id: uuid.v4(),
				appId: parsed.hash.slice(1),
				type: MT.AppRequest,
				payload: undefined
			},
			{ type: MT.AppResponse }
		);

		this.focusedApp = Model.AlvaApp.from(response.payload.app, { sender: this.server.sender });

		if (!parsed.pathname || !parsed.pathname.startsWith('/project')) {
			this.focusedProject = undefined;
			return;
		}

		const fragments = parsed.pathname.split('/').filter(Boolean);
		const id = fragments[fragments.length - 1];
		this.focusedProject = await this.server.dataHost.getProject(id);
	}

	private async onWindowBlur(win: Electron.BrowserWindow): Promise<void> {
		const parsed = Url.parse(win.webContents.getURL());
		const current = this.focusedApp ? this.focusedApp.getId() : undefined;

		if (!parsed.hash || !current) {
			return;
		}

		if (parsed.hash.slice(1) === current) {
			this.focusedApp = undefined;
			this.focusedProject = undefined;
		}
	}

	private render(ctx: {
		app: Model.AlvaApp | undefined;
		project: Model.Project | undefined;
	}): void {
		const toElectronAction = (item: Types.MenuItem): Electron.MenuItemConstructorOptions[] => {
			if (typeof (item as any).click === 'function') {
				const actionable = item as Types.ActionableMenuItem;
				const onClick = actionable.click!;
				actionable.click = () => {
					if (!this.focusedApp) {
						return;
					}
					onClick(this.focusedApp);
				};
			}

			if (Array.isArray((item as any).submenu)) {
				const nested = item as Types.NestedMenuItem;
				(nested as any).submenu = nested.submenu.map(m => toElectronAction(m));
			}

			return item as any;
		};

		const template = [
			Menu.appMenu(ctx),
			Menu.fileMenu(ctx),
			Menu.editMenu(ctx),
			Menu.libraryMenu(ctx),
			Menu.viewMenu(ctx),
			Menu.windowMenu(ctx),
			Menu.helpMenu(ctx)
		].map(toElectronAction);

		const menu = Electron.Menu.buildFromTemplate(template as any);
		Electron.Menu.setApplicationMenu(menu);
	}

	public setApp(app: Model.AlvaApp | undefined) {
		return (this.focusedApp = app);
	}

	public getApp(): Model.AlvaApp | undefined {
		return this.focusedApp;
	}
}
