import * as Electron from 'electron';
import * as Types from '../../types';

export function createHelpMenu(ctx: Types.MainMenuContext): Electron.MenuItemConstructorOptions {
	return {
		label: '&Help',
		role: 'help',
		submenu: [
			{
				label: '&Github'
			},
			{
				label: '&Quickstart'
			},
			{
				label: '&Feedback'
			},
			{
				label: '&Learn More',
				click: () => {
					Electron.shell.openExternal('https://meetalva.io/');
				}
			}
		]
	};
}
