import * as uuid from 'uuid';
import { MessageType } from '../message';
import * as Types from '@meetalva/types';
import { MenuCreator } from './context';

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

export const appMenu: MenuCreator = ctx => {
	const isElectron = ctx.app && ctx.app.isHostType(Types.HostType.Electron);

	return {
		label: 'Alva',
		role: 'app',
		id: ids.app,
		submenu: [
			{
				label: 'About Alva',
				id: ids.about,
				click: sender => {
					if (!ctx.app) {
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
