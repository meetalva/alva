import * as Electron from 'electron';
import * as Message from '../../message';
import * as Model from '../../model';
import { Sender } from '../../sender/server';
import * as Types from '../../types';
import * as uuid from 'uuid';

export interface ViewMenuInjection {
	sender: Sender;
}

export function createViewMenu(
	ctx: Types.MainMenuContext,
	injection: ViewMenuInjection
): Electron.MenuItemConstructorOptions {
	const app = Model.AlvaApp.from(ctx.app);
	const project = ctx.project ? Model.Project.from(ctx.project) : undefined;

	return {
		label: '&View',
		submenu: [
			{
				label: '&Reload',
				accelerator: 'CmdOrCtrl+R',
				click: (item: Electron.MenuItem, focusedWindow: Electron.BrowserWindow) => {
					injection.sender.send({
						id: uuid.v4(),
						type: Message.MessageType.Reload,
						payload: undefined
					});
				}
			},
			{
				label: '&Force Reload',
				accelerator: 'CmdOrCtrl+Shift+R',
				click: (item: Electron.MenuItem, focusedWindow: Electron.BrowserWindow) => {
					injection.sender.send({
						id: uuid.v4(),
						type: Message.MessageType.Reload,
						payload: {
							forced: true
						}
					});
				}
			},
			{
				label: 'Toggle &Full Screen',
				accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
				click: (item: Electron.MenuItem, focusedWindow: Electron.BrowserWindow) => {
					if (focusedWindow) {
						focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
					}
				}
			},
			{
				type: 'separator'
			},
			{
				label: 'Previous Page',
				accelerator: 'CmdOrCtrl+Alt+Left',
				enabled: project && typeof project.getPreviousPage() !== 'undefined',
				click: () => {
					const previousPage = project && project.getPreviousPage();

					if (project && previousPage) {
						injection.sender.send({
							id: uuid.v4(),
							payload: {
								id: previousPage.getId()
							},
							type: Message.MessageType.ActivatePage
						});
					}
				}
			},
			{
				label: 'Next Page',
				accelerator: 'CmdOrCtrl+Alt+Right',
				enabled: project && typeof project.getNextPage() !== 'undefined',
				click: () => {
					const nextPage = project && project.getNextPage();

					if (project && nextPage) {
						injection.sender.send({
							id: uuid.v4(),
							payload: {
								id: nextPage.getId()
							},
							type: Message.MessageType.ActivatePage
						});
					}
				}
			},
			{
				type: 'separator'
			},
			{
				label: 'Show Pages',
				type: 'checkbox',
				checked: app.getPanes().has(Types.AppPane.PagesPane),
				enabled: app.getActiveView() === Types.AlvaView.PageDetail,
				accelerator: 'CmdOrCtrl+Alt+1',
				click: () => {
					injection.sender.send({
						id: uuid.v4(),
						payload: {
							pane: Types.AppPane.PagesPane,
							visible: !app.getPanes().has(Types.AppPane.PagesPane)
						},
						type: Message.MessageType.SetPane
					});
				}
			},
			{
				label: 'Show Elements and Library',
				type: 'checkbox',
				checked: app.getPanes().has(Types.AppPane.ElementsPane),
				enabled: app.getActiveView() === Types.AlvaView.PageDetail,
				accelerator: 'CmdOrCtrl+Alt+2',
				click: () => {
					injection.sender.send({
						id: uuid.v4(),
						payload: {
							pane: Types.AppPane.ElementsPane,
							visible: !app.getPanes().has(Types.AppPane.ElementsPane)
						},
						type: Message.MessageType.SetPane
					});
				}
			},
			{
				label: 'Show Properties',
				type: 'checkbox',
				checked: app.getPanes().has(Types.AppPane.PropertiesPane),
				enabled: app.getActiveView() === Types.AlvaView.PageDetail,
				accelerator: 'CmdOrCtrl+Alt+3',
				click: (item, checked) => {
					injection.sender.send({
						id: uuid.v4(),
						payload: {
							pane: Types.AppPane.PropertiesPane,
							visible: !app.getPanes().has(Types.AppPane.PropertiesPane)
						},
						type: Message.MessageType.SetPane
					});
				}
			},
			{
				type: 'separator'
			},
			{
				label: 'Toggle &Developer Tools',
				accelerator: (() => {
					if (process.platform === 'darwin') {
						return 'Alt+Command+I';
					} else {
						return 'Ctrl+Shift+I';
					}
				})(),
				click: (item: Electron.MenuItem, focusedWindow: Electron.BrowserWindow) => {
					if (focusedWindow) {
						focusedWindow.webContents.toggleDevTools();
					}
				}
			}
		]
	};
}
