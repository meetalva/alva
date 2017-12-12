import { MenuItemConstructorOptions, remote } from 'electron';
import { Store } from '../store';
const { Menu } = remote;

export function createMenu(store: Store): void {
	const menuTemplate: MenuItemConstructorOptions[] = [
		{
			label: 'Alva',
			submenu: []
		},
		{
			label: 'Edit',
			submenu: [
				{
					label: 'Save',
					accelerator: 'Cmd+S',
					role: 'save',
					click: () => {
						store.savePage();
					}
				}
			]
		},
		{
			label: 'View',
			submenu: [
				{
					label: 'Toggle Developer Tools',
					accelerator: 'Cmd+Alt+I',
					role: 'save',
					click: () => {
						remote.getCurrentWindow().webContents.openDevTools();
					}
				}
			]
		}
	];

	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
}
