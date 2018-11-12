import * as uuid from 'uuid';
import * as Message from '../message';
import * as Types from '../types';

const ids = {
	view: uuid.v4(),
	reload: uuid.v4(),
	forceReload: uuid.v4(),
	fullscreen: uuid.v4(),
	previousPage: uuid.v4(),
	nextPage: uuid.v4(),
	showPages: uuid.v4(),
	showElements: uuid.v4(),
	showProperties: uuid.v4(),
	showEditor: uuid.v4(),
	devTools: uuid.v4()
};

export const viewMenu = (ctx: Types.MenuContext): Types.MenuItem => {
	const isLocal = ctx.app && !ctx.app.isHostType(Types.HostType.RemoteServer);
	const isElectron = ctx.app && ctx.app.isHostType(Types.HostType.LocalElectron);

	return {
		id: ids.view,
		label: '&View',
		submenu: [
			{
				id: ids.reload,
				label: '&Reload',
				enabled: isLocal,
				accelerator: 'CmdOrCtrl+R',
				click: sender => {
					sender.send({
						id: uuid.v4(),
						type: Message.MessageType.Reload,
						payload: undefined
					});
				}
			},
			{
				id: ids.forceReload,
				label: '&Force Reload',
				accelerator: 'CmdOrCtrl+Shift+R',
				visible: isLocal,
				// TODO: implement
				// enabled: isConnected,
				click: sender => {
					sender.send({
						id: uuid.v4(),
						type: Message.MessageType.Reload,
						payload: {
							forced: true
						}
					});
				}
			},
			{
				id: ids.fullscreen,
				label: 'Toggle &Full Screen',
				accelerator: 'Ctrl+Command+F',
				click: sender => {
					// TODO: Implement receiver part
					sender.send({
						id: uuid.v4(),
						type: Message.MessageType.ToggleFullScreen,
						payload: undefined
					});
				}
			},
			{
				type: 'separator'
			},
			{
				id: ids.previousPage,
				label: 'Previous Page',
				accelerator: 'CmdOrCtrl+Alt+Left',
				enabled: ctx.project && typeof ctx.project.getPreviousPage() !== 'undefined',
				click: sender => {
					const previousPage = ctx.project && ctx.project.getPreviousPage();

					if (previousPage) {
						sender.send({
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
				id: ids.nextPage,
				label: 'Next Page',
				accelerator: 'CmdOrCtrl+Alt+Right',
				enabled: ctx.project && typeof ctx.project.getNextPage() !== 'undefined',
				click: sender => {
					const nextPage = ctx.project && ctx.project.getNextPage();

					if (ctx.project && nextPage) {
						sender.send({
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
				id: ids.showPages,
				label: 'Show Pages',
				type: 'checkbox',
				checked: ctx.app && ctx.app.getPanes().has(Types.AppPane.PagesPane),
				enabled: ctx.app && ctx.app.getActiveView() === Types.AlvaView.PageDetail,
				accelerator: 'CmdOrCtrl+Alt+1',
				click: sender => {
					sender.send({
						id: uuid.v4(),
						payload: {
							pane: Types.AppPane.PagesPane,
							visible: ctx.app ? !ctx.app.getPanes().has(Types.AppPane.PagesPane) : false
						},
						type: Message.MessageType.SetPane
					});
				}
			},
			{
				id: ids.showElements,
				label: 'Show Elements and Library',
				type: 'checkbox',
				checked: ctx.app && ctx.app.getPanes().has(Types.AppPane.ElementsPane),
				enabled: ctx.app && ctx.app.getActiveView() === Types.AlvaView.PageDetail,
				accelerator: 'CmdOrCtrl+Alt+2',
				click: sender => {
					sender.send({
						id: uuid.v4(),
						payload: {
							pane: Types.AppPane.ElementsPane,
							visible: ctx.app ? !ctx.app.getPanes().has(Types.AppPane.ElementsPane) : false
						},
						type: Message.MessageType.SetPane
					});
				}
			},
			{
				id: ids.showProperties,
				label: 'Show Properties',
				type: 'checkbox',
				checked: ctx.app && ctx.app.getPanes().has(Types.AppPane.PropertiesPane),
				enabled: ctx.app && ctx.app.getActiveView() === Types.AlvaView.PageDetail,
				accelerator: 'CmdOrCtrl+Alt+3',
				click: sender => {
					sender.send({
						id: uuid.v4(),
						payload: {
							pane: Types.AppPane.PropertiesPane,
							visible: ctx.app
								? !ctx.app.getPanes().has(Types.AppPane.PropertiesPane)
								: false
						},
						type: Message.MessageType.SetPane
					});
				}
			},
			{
				id: ids.showEditor,
				label: 'Show Development Editor',
				type: 'checkbox',
				checked: ctx.app && ctx.app.getPanes().has(Types.AppPane.DevelopmentPane),
				enabled: ctx.app && ctx.app.getActiveView() === Types.AlvaView.PageDetail,
				accelerator: 'CmdOrCtrl+Alt+4',
				click: sender => {
					sender.send({
						id: uuid.v4(),
						payload: {
							pane: Types.AppPane.DevelopmentPane,
							visible: ctx.app
								? !ctx.app.getPanes().has(Types.AppPane.DevelopmentPane)
								: false
						},
						type: Message.MessageType.SetPane
					});
				}
			},
			{
				type: 'separator',
				visible: isElectron
			},
			{
				id: ids.devTools,
				label: 'Toggle &Developer Tools',
				visible: isElectron,
				accelerator: 'Alt+Command+I',
				click: sender => {
					// TODO: Sender ToggleDevTools message
				}
			}
		]
	};
};
