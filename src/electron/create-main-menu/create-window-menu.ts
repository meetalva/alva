import * as Electron from 'electron';
import { MainMenuContext } from '.';

export function createWindowMenu(ctx: MainMenuContext): Electron.MenuItemConstructorOptions {
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
