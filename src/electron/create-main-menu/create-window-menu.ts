import * as Electron from 'electron';
import * as Types from '../../types';

export function createWindowMenu(ctx: Types.MainMenuContext): Electron.MenuItemConstructorOptions {
	const bringToFront: Electron.MenuItemConstructorOptions[] =
		process.platform === 'darwin'
			? /* prettier-ignore */ [
				{
					type: 'separator'
				},
				{
					label: 'Bring All to Front',
					role: 'front'
				}
			]
			: [];

	return {
		label: '&Window',
		role: 'window',
		submenu: [
			{
				label: '&Minimize',
				accelerator: 'CmdOrCtrl+M',
				role: 'minimize'
			},
			...bringToFront
		]
	};
}
