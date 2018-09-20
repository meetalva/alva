import * as Electron from 'electron';
import { MainMenuContext } from '.';

export function createHelpMenu(ctx: MainMenuContext): Electron.MenuItemConstructorOptions {
	return {
		label: '&Help',
		role: 'help',
		submenu: [
			{
				label: '&Help and Getting Started',
				click: () => {
					Electron.shell.openExternal(
						'https://meetalva.io/doc/docs/guides/start?guides-enabled=true'
					);
				}
			},
			{
				label: '&Github',
				click: () => {
					Electron.shell.openExternal('https://github.com/meetalva/alva');
				}
			},
			{
				label: '&Feedback: hey@meetalva.io',
				click: () => {
					Electron.shell.openExternal('mailto:hey@meetalva.io');
				}
			},
			{
				label: '&Alva Website',
				click: () => {
					Electron.shell.openExternal('https://meetalva.io/');
				}
			}
		]
	};
}
