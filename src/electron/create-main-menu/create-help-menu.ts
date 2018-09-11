import * as Electron from 'electron';
import { MainMenuContext } from '.';

export function createHelpMenu(ctx: MainMenuContext): Electron.MenuItemConstructorOptions {
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
