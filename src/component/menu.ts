import { BrowserWindow, MenuItem, MenuItemConstructorOptions, remote, WebContents } from 'electron';
import { PageElement } from '../store/page/page_element';
import { Store } from '../store';
const { Menu, shell, app, dialog } = remote;

export function createMenu(store: Store): void {
	const template: MenuItemConstructorOptions[] = [
		{
			label: '&File',
			submenu: [
				{
					label: '&Open Project',
					click: () => {
						dialog.showOpenDialog({ properties: ['openDirectory'] }, filePaths => {
							store.openStyleguide(filePaths[0]);
							store.openPage('homepage');
						});
					}
				},
				{
					label: 'New &Page',
					accelerator: 'CmdOrCtrl+N'
				},
				{
					label: 'New P&roject',
					accelerator: 'CmdOrCtrl+Shift+N'
				},
				{
					type: 'separator'
				},
				{
					label: '&Save',
					accelerator: 'CmdOrCtrl+S',
					role: 'save',
					click: () => {
						store.save();
					}
				},
				{
					label: '&Rename',
					role: 'rename'
				},
				{
					type: 'separator'
				},
				{
					label: '&Close',
					accelerator: 'CmdOrCtrl+W',
					role: 'close'
				}
			]
		},
		{
			label: '&Edit',
			submenu: [
				{
					label: '&Undo',
					accelerator: 'CmdOrCtrl+Z',
					role: 'undo'
				},
				{
					label: '&Redo',
					accelerator: 'Shift+CmdOrCtrl+Z',
					role: 'redo'
				},
				{
					type: 'separator'
				},
				{
					label: '&Cut',
					accelerator: 'CmdOrCtrl+X',
					click: () => {
						const selectedElement: PageElement | undefined = store.getSelectedElement();
						if (selectedElement && store.getElementFocus()) {
							store.setClipboardElement(selectedElement);
							selectedElement.remove();
						}
						Menu.sendActionToFirstResponder('cut:');
					}
				},
				{
					label: 'C&opy',
					accelerator: 'CmdOrCtrl+C',
					click: () => {
						const selectedElement: PageElement | undefined = store.getSelectedElement();
						if (selectedElement && store.getElementFocus()) {
							store.setClipboardElement(selectedElement);
						}
						Menu.sendActionToFirstResponder('copy:');
					}
				},
				{
					label: '&Paste',
					accelerator: 'CmdOrCtrl+V',
					click: () => {
						const selectedElement: PageElement | undefined = store.getSelectedElement();
						const clipboardElement: PageElement | undefined = store.getClipboardElement();
						if (selectedElement && clipboardElement && store.getElementFocus()) {
							selectedElement.addChild(clipboardElement.clone());
						}
						Menu.sendActionToFirstResponder('paste:');
					}
				},
				{
					label: '&Select All',
					accelerator: 'CmdOrCtrl+A',
					role: 'selectall'
				},
				{
					type: 'separator'
				},
				{
					label: '&Delete',
					accelerator: 'Backspace',
					click: () => {
						console.log('delete');
						const selectedElement: PageElement | undefined = store.getSelectedElement();
						if (selectedElement) {
							selectedElement.remove();
						} else {
							Menu.sendActionToFirstResponder('Backspace');
						}
					}
				}
			]
		},
		{
			label: '&View',
			submenu: [
				{
					label: '&Reload',
					accelerator: 'CmdOrCtrl+R',
					click: (item: MenuItem, focusedWindow: BrowserWindow) => {
						if (focusedWindow) {
							focusedWindow.reload();
						}
					}
				},
				{
					label: 'Toggle &Full Screen',
					accelerator: (() => {
						if (process.platform === 'darwin') {
							return 'Ctrl+Command+F';
						} else {
							return 'F11';
						}
					})(),
					click: (item: MenuItem, focusedWindow: BrowserWindow) => {
						if (focusedWindow) {
							focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
						}
					}
				},
				{
					label: 'Toggle &Developer Tools',
					accelerator: (() => {
						if (process.platform === 'darwin') {
							return 'Alt+Command+I';
						} else {
							return 'Ctrl+Shift+I';
						}
					})(),
					click: (item: MenuItem, focusedWindow: WebContents) => {
						if (focusedWindow) {
							focusedWindow.toggleDevTools();
						}
					}
				}
			]
		},
		{
			label: '&Window',
			role: 'window',
			submenu: [
				{
					label: '&Minimize',
					accelerator: 'CmdOrCtrl+M',
					role: 'minimize'
				}
			]
		},
		{
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
				(windowMenu.submenu as MenuItemConstructorOptions[]).push(
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
