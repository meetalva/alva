import * as uuid from 'uuid';
import * as Types from '@meetalva/types';
import { MenuCreator } from './context';

const ids = {
	window: uuid.v4(),
	minimize: uuid.v4(),
	front: uuid.v4()
};

export const windowMenu: MenuCreator = ctx => {
	const isElectron = ctx.app ? ctx.app.isHostType(Types.HostType.Electron) : false;

	return {
		id: ids.window,
		label: '&Window',
		role: 'window',
		visible: isElectron,
		submenu: [
			{
				id: ids.minimize,
				label: '&Minimize',
				accelerator: 'CmdOrCtrl+M',
				role: 'minimize'
			},
			{
				id: uuid.v4(),
				type: 'separator'
			},
			{
				id: ids.front,
				label: 'Bring All to Front',
				role: 'front'
			}
		]
	};
};
