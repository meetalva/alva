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
	showEditor: uuid.v4()
};

export const viewMenu = (ctx: Types.MenuContext): Types.MenuItem => {
	const isElectron = typeof ctx.app !== 'undefined' && ctx.app.isHostType(Types.HostType.Electron);
	const hasNextPage =
		typeof ctx.project !== 'undefined' && typeof ctx.project.getNextPage() !== 'undefined';
	const hasPreviousPage =
		typeof ctx.project !== 'undefined' && typeof ctx.project.getPreviousPage() !== 'undefined';

	return {
		id: ids.view,
		label: '&View',
		submenu: [
			{
				id: ids.reload,
				label: '&Reload',
				visible: !isElectron,
				accelerator: 'CmdOrCtrl+R',
				click: app => {
					app.send({
						id: uuid.v4(),
						type: Message.MessageType.Reload,
						payload: undefined
					});
				}
			},
			{
				id: ids.fullscreen,
				label: 'Toggle &Full Screen',
				visible: isElectron,
				accelerator: 'Ctrl+Command+F',
				click: app => {
					app.send({
						id: uuid.v4(),
						type: Message.MessageType.ToggleFullScreen,
						payload: undefined
					});
				}
			},
			{
				id: uuid.v4(),
				type: 'separator'
			},
			{
				id: ids.previousPage,
				label: 'Previous Page',
				accelerator: 'CmdOrCtrl+Alt+Left',
				enabled: hasPreviousPage,
				click: app => {
					const previousPage = ctx.project && ctx.project.getPreviousPage();

					if (previousPage) {
						app.send({
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
				enabled: hasNextPage,
				click: app => {
					const nextPage = ctx.project && ctx.project.getNextPage();

					if (ctx.project && nextPage) {
						app.send({
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
				id: uuid.v4(),
				type: 'separator'
			},
			{
				id: ids.showPages,
				label: 'Show Pages',
				type: 'checkbox',
				checked: ctx.app && ctx.app.getPanes().has(Types.AppPane.PagesPane),
				enabled: ctx.app && ctx.app.getActiveView() === Types.AlvaView.PageDetail,
				accelerator: 'CmdOrCtrl+Alt+1',
				click: app => {
					app.send({
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
				click: app => {
					app.send({
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
				click: app => {
					app.send({
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
				label: 'Show Variable Editor',
				type: 'checkbox',
				checked: ctx.app && ctx.app.getPanes().has(Types.AppPane.DevelopmentPane),
				enabled: ctx.app && ctx.app.getActiveView() === Types.AlvaView.PageDetail,
				accelerator: 'CmdOrCtrl+Alt+4',
				click: app => {
					app.send({
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
				id: uuid.v4(),
				type: 'separator',
				visible: isElectron
			}
		]
	};
};
