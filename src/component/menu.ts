import { MenuItemConstructorOptions, remote } from 'electron';
import { Store } from '../store';
const { Menu, shell, app } = remote;

export function createMenu(store: Store): void {
	const template: MenuItemConstructorOptions[] = [
		{
			label: 'File',
			submenu: [
				{
					label: 'New Page',
					accelerator: 'CmdOrCtrl+N'
				},
				{
					label: 'New Composition',
					accelerator: 'CmdOrCtrl+Shift+N'
				},
				{
					type: 'separator'
				},
				{
					label: 'Save',
					accelerator: 'CmdOrCtrl+S',
					role: 'save',
					click: () => {
						store.savePage();
					}
				},
				{
					label: 'Rename',
					role: 'rename'
				},
				{
					type: 'separator'
				},
				{
					label: 'Close',
					accelerator: 'CmdOrCtrl+W',
					role: 'close'
				}
			]
		},
		{
			label: 'Edit',
			submenu: [
				{
					label: 'Undo',
					accelerator: 'CmdOrCtrl+Z',
					role: 'undo'
				},
				{
					label: 'Redo',
					accelerator: 'Shift+CmdOrCtrl+Z',
					role: 'redo'
				},
				{
					type: 'separator'
				},
				{
					label: 'Cut',
					accelerator: 'CmdOrCtrl+X',
					role: 'cut'
				},
				{
					label: 'Copy',
					accelerator: 'CmdOrCtrl+C',
					role: 'copy'
				},
				{
					label: 'Paste',
					accelerator: 'CmdOrCtrl+V',
					role: 'paste'
				},
				{
					label: 'Select All',
					accelerator: 'CmdOrCtrl+A',
					role: 'selectall'
				}
			]
		},
		{
			label: 'View',
			submenu: [
				{
					label: 'Reload',
					accelerator: 'CmdOrCtrl+R',
					// tslint:disable-next-line:no-any
					click: (item: any, focusedWindow: any) => {
						if (focusedWindow) {
							focusedWindow.reload();
						}
					}
				},
				{
					label: 'Toggle Full Screen',
					accelerator: (() => {
						if (process.platform === 'darwin') {
							return 'Ctrl+Command+F';
						} else {
							return 'F11';
						}
					})(),
					// tslint:disable-next-line:no-any
					click: (item: any, focusedWindow: any) => {
						if (focusedWindow) {
							focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
						}
					}
				},
				{
					label: 'Toggle Developer Tools',
					accelerator: (() => {
						if (process.platform === 'darwin') {
							return 'Alt+Command+I';
						} else {
							return 'Ctrl+Shift+I';
						}
					})(),
					// tslint:disable-next-line:no-any
					click: (item: any, focusedWindow: any) => {
						if (focusedWindow) {
							focusedWindow.toggleDevTools();
						}
					}
				}
			]
		},
		{
			label: 'Window',
			role: 'window',
			submenu: [
				{
					label: 'Minimize',
					accelerator: 'CmdOrCtrl+M',
					role: 'minimize'
				},
				{
					label: 'Close',
					accelerator: 'CmdOrCtrl+W',
					role: 'close'
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
				},
				{
					label: 'Learn More',
					click: () => {
						shell.openExternal('https://meetalva.github.io/');
					}
				}
			]
		}
	];

	if (process.platform === 'darwin') {
		const name = app.getName();
		template.unshift({
			label: name,
			submenu: [
				{
					label: 'About ' + name,
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
					label: 'Services',
					role: 'services',
					submenu: []
				},
				{
					type: 'separator'
				},
				{
					label: 'Hide ' + name,
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
					click: () => {
						app.quit();
					}
				}
			]
		});
		const windowMenu = template.find(m => m.role === 'window');
		if (windowMenu) {
			windowMenu.submenu &&
				// tslint:disable-next-line:no-any
				(windowMenu.submenu as any).push(
					{
						type: 'separator'
					},
					{
						label: 'Bring All to Front',
						role: 'front'
					}
				);
		}
	}

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}
