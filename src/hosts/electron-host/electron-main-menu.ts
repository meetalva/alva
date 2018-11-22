import * as Electron from 'electron';
import * as M from '../../message';
import * as Mobx from 'mobx';
import * as Model from '../../model';
import * as Menu from '../../menu';
import * as Types from '../../types';

export class ElectronMainMenu {
	private dataHost: Types.DataHost;

	@Mobx.observable private apps: Map<string, Model.AlvaApp> = new Map();
	@Mobx.observable private focusedAppId: string | undefined;
	@Mobx.observable private focusedProjectId: string | undefined;

	@Mobx.computed
	public get focusedApp(): Model.AlvaApp | undefined {
		return this.focusedAppId ? this.apps.get(this.focusedAppId) : undefined;
	}

	@Mobx.computed
	public get focusedProject(): Promise<Model.Project | undefined> {
		return this.focusedProjectId
			? this.dataHost.getProject(this.focusedProjectId)
			: Promise.resolve(undefined);
	}

	public start(server: Types.AlvaServer): void {
		this.dataHost = server.dataHost;

		server.sender.match<M.WindowFocused>(M.MessageType.WindowFocused, m => {
			const app = Model.AlvaApp.from(m.payload.app);
			this.apps.set(app.getId(), app);
			this.focusedAppId = app.getId();
			this.focusedProjectId = m.payload.projectId;
			app.setSender(server.sender);
		});

		server.sender.match<M.ChangeApp>(M.MessageType.ChangeApp, m => {
			const app = Model.AlvaApp.from(m.payload.app);
			this.apps.set(app.getId(), app);
			app.setSender(server.sender);
		});

		Mobx.autorun(async () => {
			const ctx = {
				app: this.focusedApp,
				project: await this.focusedProject
			};

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
		});
	}
}
