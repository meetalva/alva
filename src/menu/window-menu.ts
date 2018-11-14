import * as uuid from 'uuid';
import * as Types from '../types';

const ids = {
	window: uuid.v4(),
	minimize: uuid.v4(),
	front: uuid.v4()
};

export const windowMenu = (ctx: Types.MenuContext): Types.MenuItem => {
	const isElectron = ctx.app ? ctx.app.isHostType(Types.HostType.LocalElectron) : false;

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
