import * as uuid from 'uuid';
import { MessageType } from '../message';
import * as Types from '../types';

const pkg = require('../../package.json');

const ids = {
	app: uuid.v4(),
	about: uuid.v4(),
	updates: uuid.v4(),
	services: uuid.v4(),
	hide: uuid.v4(),
	hideOthers: uuid.v4(),
	showAll: uuid.v4(),
	quit: uuid.v4()
};

export const appMenu = (ctx: Types.MenuContext): Types.MenuItem => {
	const isElectron = ctx.app && ctx.app.isHostType(Types.HostType.Electron);

	return {
		label: 'Alva',
		role: 'app',
		id: ids.app,
		submenu: [
			{
				label: 'About Alva',
				role: 'about',
				id: ids.about,
				click: sender => {
					setTimeout(() => {
						if (isElectron || !ctx.app) {
							return;
						}

						sender.send({
							id: uuid.v4(),
							payload: {
								message: `Alva – v${pkg.version}`,
								detail: [
									'',
									pkg.description,
									'',
									`Host: ${ctx.app.getHostType()}`,
									`License: ${pkg.license}`
								].join('\n'),
								buttons: []
							},
							type: MessageType.ShowMessage
						});
					}, 100);
				}
			},
			{
				id: uuid.v4(),
				type: 'separator',
				visible: isElectron
			},
			{
				id: ids.services,
				label: 'Services',
				role: 'services',
				visible: isElectron,
				submenu: []
			},
			{
				id: uuid.v4(),
				type: 'separator',
				visible: isElectron
			},
			{
				id: ids.hide,
				label: 'Hide Alva',
				accelerator: 'Command+H',
				role: 'hide',
				visible: isElectron
			},
			{
				id: ids.hideOthers,
				label: 'Hide Others',
				accelerator: 'Command+Shift+H',
				role: 'hideothers',
				visible: isElectron
			},
			{
				id: ids.showAll,
				label: 'Show All',
				role: 'unhide',
				visible: isElectron
			},
			{
				id: uuid.v4(),
				type: 'separator',
				visible: isElectron
			},
			{
				id: ids.quit,
				label: 'Quit',
				accelerator: 'Command+Q',
				role: 'quit',
				visible: isElectron
			}
		]
	};
};
