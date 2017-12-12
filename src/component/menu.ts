import { MenuItemConstructorOptions, remote } from 'electron';
import { Store } from '../store';
const { Menu } = remote;

export function createMenu(store: Store): void {
	const menuTemplate: MenuItemConstructorOptions[] = [
		{
			label: 'Alva',
			submenu: [
				{
					label: 'About Alva',
					role: 'about'
				},
				{
					type: 'separator'
				},
				{
					label: 'Preferences…',
					accelerator: 'Cmd+,',
					role: 'preferences'
				},
				{
					type: 'separator'
				},
				{
					label: 'Hide Alva',
					accelerator: 'Cmd+H',
					role: 'hide'
				},
				{
					label: 'Hide Others',
					accelerator: 'Alt+Cmd+H',
					role: 'hideothers'
				},
				{
					type: 'separator'
				},
				{
					label: 'Quit',
					accelerator: 'Cmd+Q',
					role: 'quit'
				}
			]
		},
		{
			label: 'File',
			submenu: [
				{
					label: 'New Page',
					accelerator: 'Cmd+N'
				},
				{
					label: 'New Composition',
					accelerator: 'Cmd+Shift+N'
				},
				{
					label: 'Close',
					accelerator: 'Cmd+W',
					role: 'close'
				},
				{
					type: 'separator'
				},
				{
					label: 'Save',
					accelerator: 'Cmd+S',
					role: 'save',
					click: () => {
						store.savePage();
					}
				},
				{
					label: 'Rename',
					role: 'rename'
				}
			]
		},
		{
			label: 'Edit',
			submenu: [
				{
					label: 'Undo',
					accelerator: 'Cmd+Z',
					role: 'undo'
				},
				{
					label: 'Redo',
					accelerator: 'Shift+Cmd+Z',
					role: 'Redo'
				},
				{
					type: 'separator'
				},
				{
					label: 'Cut',
					accelerator: 'Cmd+X',
					role: 'cut'
				},
				{
					label: 'Copy',
					accelerator: 'Cmd+C',
					role: 'copy'
				},
				{
					label: 'Paste',
					accelerator: 'Cmd+V',
					role: 'paste'
				},
				{
					label: 'Select All',
					accelerator: 'Cmd+A',
					role: 'selectall'
				},
				{
					type: 'separator'
				}
			]
		},
		{
			label: 'View',
			submenu: [
				{
					label: 'Full Screen',
					accelerator: 'Ctrl+Cmd+F',
					role: 'togglefullscreen'
				},
				{
					type: 'separator'
				},
				{
					label: 'Reload',
					accelerator: 'Cmd+R',
					role: 'reload'
				},
				{
					label: 'Force Reload',
					accelerator: 'Shift+Cmd+R',
					role: 'forcereload'
				},
				{
					type: 'separator'
				},
				{
					label: 'Toggle Developer Tools',
					accelerator: 'Cmd+Alt+I',
					role: 'toggledevtools'
				}
			]
		},
		{
			label: 'Window',
			role: 'window',
			submenu: [
				{
					label: 'Minimize',
					accelerator: 'Cmd+M',
					role: 'minimize'
				},
				{
					type: 'separator'
				}
			]
		},
		{
			label: 'Help',
			role: 'help',
			submenu: [
				{
					label: 'Github'
				},
				{
					label: 'Quickstart'
				},
				{
					label: 'Feedback'
				}
			]
		}
	];

	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
}
