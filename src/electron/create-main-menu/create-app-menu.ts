import * as Electron from 'electron';
import { Sender } from '../../sender/server';
import { MessageType } from '../../message';
import { MainMenuContext } from '.';
import * as uuid from 'uuid';

export interface AppMenuInjection {
	sender: Sender;
}

export function createAppMenu(
	ctx: MainMenuContext,
	injecton: AppMenuInjection
): Electron.MenuItemConstructorOptions | undefined {
	if (process.platform !== 'darwin') {
		return;
	}

	return {
		label: 'Alva',
		role: 'app',
		submenu: [
			{
				label: 'About Alva'
			},
			{
				label: 'Check for Updates',
				click: () => {
					injecton.sender.send({
						id: uuid.v4(),
						payload: undefined,
						type: MessageType.CheckForUpdatesRequest
					});
				}
			},
			{
				type: 'separator'
			},
			{
				label: 'Services',
				role: 'services',
				submenu: []
			},
			{
				type: 'separator'
			},
			{
				label: 'Hide Alva',
				accelerator: 'Command+H',
				role: 'hide'
			},
			{
				label: 'Hide Others',
				accelerator: 'Command+Shift+H',
				role: 'hideothers'
			},
			{
				label: 'Show All',
				role: 'unhide'
			},
			{
				type: 'separator'
			},
			{
				label: 'Quit',
				accelerator: 'Command+Q',
				role: 'quit'
			}
		]
	};
}
