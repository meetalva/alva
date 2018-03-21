import {
	BrowserWindow,
	ipcRenderer,
	MenuItem,
	MenuItemConstructorOptions,
	remote,
	WebviewTag
} from 'electron';
import { ElementCommand } from '../store/command/element-command';
import * as FileExtraUtils from 'fs-extra';
import { PageElement } from '../store/page/page-element';
import * as PathUtils from 'path';
import * as ProcessUtils from 'process';
import { Store } from '../store/store';
const { screen, Menu, shell, app, dialog } = remote;

export function createMenu(): void {
	const store = Store.getInstance();
	const isSplashscreen: boolean = !Boolean(store.getCurrentProject());
	const template: MenuItemConstructorOptions[] = [
		{
			label: '&File',
			submenu: [
				{
					label: '&Create Styleguide',
					click: () => {
						let appPath: string = app.getAppPath().replace('.asar', '.asar.unpacked');
						if (appPath.indexOf('node_modules') >= 0) {
							appPath = ProcessUtils.cwd();
						}

						const designkitPath = PathUtils.join(appPath, 'build', 'designkit');
						dialog.showOpenDialog(
							{ properties: ['openDirectory', 'createDirectory'] },
							filePaths => {
								if (filePaths.length <= 0) {
									return;
								}

								FileExtraUtils.copySync(
									designkitPath,
									PathUtils.join(filePaths[0], 'designkit')
								);
								store.openStyleguide(`${filePaths[0]}/designkit`);
								store.openFirstPage();
							}
						);
					}
				},
				{
					label: '&Open Styleguide',
					accelerator: 'CmdOrCtrl+O',
					click: () => {
						dialog.showOpenDialog({ properties: ['openDirectory'] }, filePaths => {
							store.openStyleguide(filePaths[0]);
							store.openFirstPage();
						});
					}
				},
				{
					type: 'separator'
				},
				{
					label: 'New &Page',
					enabled: !isSplashscreen,
					accelerator: 'CmdOrCtrl+N'
				},
				{
					label: 'New P&roject',
					enabled: !isSplashscreen,
					accelerator: 'CmdOrCtrl+Shift+N'
				},
				{
					type: 'separator'
				},
				{
					label: '&Save',
					enabled: !isSplashscreen,
					accelerator: 'CmdOrCtrl+S',
					role: 'save',
					click: () => {
						store.save();
					}
				},
				{
					label: '&Rename',
					enabled: !isSplashscreen,
					role: 'rename'
				},
				{
					type: 'separator'
				},
				{
					label: 'Se&ttings',
					visible: process.platform !== 'darwin',
					accelerator: 'Cmd+,',
					click: () => {
						shell.openItem(store.getPreferencesPath());
					}
				},
				{
					label: 'Export page as PNG',
					enabled: !isSplashscreen,
					click: () => {
						const webview = document.getElementById('preview') as WebviewTag;

						// code that gets executed inside the webview to get
						// the actual size of the preview body
						const code = `
							bodyTag = document.querySelector('body');
							r = {};
							r.pageHeight = bodyTag.getBoundingClientRect().height;
							r.pageWidth = bodyTag.getBoundingClientRect().width;
							r;
						`;

						webview.executeJavaScript(code, false, webviewSize => {
							// set the height of the webview tag to the preview body height
							// This is needed because capturePage can not capture anything that renders
							// outside the webview area (https://github.com/electron/electron/issues/9845)
							webview.style.height = webviewSize.pageHeight;

							// Delay the page capture to make sure that the style height changes are done.
							// This is only needed because of the change in height in the above line
							setTimeout(() => {
								const scaleFactor = screen.getPrimaryDisplay().scaleFactor;
								webview.capturePage(
									{
										x: 0,
										y: 0,
										// round the numbers to remove possible floating numbers
										// also multiply by scaleFactor for devices with higher pixel ratio:
										// https://github.com/electron/electron/issues/8314
										width: Math.round(webviewSize.pageWidth * scaleFactor),
										height: Math.round(webviewSize.pageHeight * scaleFactor)
									},
									capture => {
										const pngBuffer: Buffer = capture.toPNG();

										dialog.showSaveDialog(
											{
												filters: [{ name: 'Untitled', extensions: ['png'] }]
											},
											filename => {
												// reset the webview height
												webview.style.height = '100%';

												if (!filename) {
													return;
												}

												FileExtraUtils.writeFileSync(filename, pngBuffer);
											}
										);
									}
								);
							}, 100);
						});
					}
				},
				{
					type: 'separator',
					visible: process.platform !== 'darwin'
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
					click: () => {
						store.undo();
					}
				},
				{
					label: '&Redo',
					accelerator: 'Shift+CmdOrCtrl+Z',
					click: () => {
						store.redo();
					}
				},
				{
					type: 'separator'
				},
				{
					label: '&Cut',
					enabled: !isSplashscreen,
					accelerator: 'CmdOrCtrl+X',
					click: () => {
						const selectedElement: PageElement | undefined = store.getSelectedElement();
						if (selectedElement && store.isElementFocussed()) {
							store.setClipboardElement(selectedElement);
							store.execute(ElementCommand.remove(selectedElement));
						}
						Menu.sendActionToFirstResponder('cut:');
					}
				},
				{
					label: 'C&opy',
					enabled: !isSplashscreen,
					accelerator: 'CmdOrCtrl+C',
					click: () => {
						const selectedElement: PageElement | undefined = store.getSelectedElement();
						if (selectedElement && store.isElementFocussed()) {
							store.setClipboardElement(selectedElement);
						}
						Menu.sendActionToFirstResponder('copy:');
					}
				},
				{
					label: '&Paste',
					enabled: !isSplashscreen,
					accelerator: 'CmdOrCtrl+V',
					click: () => {
						const selectedElement: PageElement | undefined = store.getSelectedElement();
						const clipboardElement: PageElement | undefined = store.getClipboardElement();
						if (selectedElement && clipboardElement && store.isElementFocussed()) {
							const newPageElement = clipboardElement.clone();
							store.execute(ElementCommand.addSibling(selectedElement, newPageElement));
							store.setSelectedElement(newPageElement);
						}
						Menu.sendActionToFirstResponder('paste:');
					}
				},
				{
					type: 'separator'
				},
				{
					label: '&Duplicate',
					enabled: !isSplashscreen,
					accelerator: 'CmdOrCtrl+D',
					click: () => {
						const selectedElement: PageElement | undefined = store.getSelectedElement();
						if (selectedElement && store.isElementFocussed()) {
							const newPageElement = selectedElement.clone();
							store.execute(ElementCommand.addSibling(selectedElement, newPageElement));
							store.setSelectedElement(newPageElement);
						}
					}
				},
				{
					type: 'separator'
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
					enabled: !isSplashscreen,
					accelerator: (() => {
						if (process.platform === 'darwin') {
							return 'Backspace';
						} else {
							return 'Delete';
						}
					})(),
					click: () => {
						const selectedElement: PageElement | undefined = store.getSelectedElement();
						if (selectedElement) {
							store.execute(ElementCommand.remove(selectedElement));
							store.setSelectedElement(undefined);
						} else {
							if (process.platform === 'darwin') {
								Menu.sendActionToFirstResponder('Backspace');
							} else {
								Menu.sendActionToFirstResponder('Delete');
							}
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
					click: (item: MenuItem, focusedWindow: BrowserWindow) => {
						if (focusedWindow) {
							focusedWindow.webContents.toggleDevTools();
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
						shell.openExternal('https://meetalva.io/');
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
					label: 'Check for Updates',
					click: () => {
						ipcRenderer.send('request-check-for-updates');
					}
				},
				{
					type: 'separator'
				},
				{
					label: 'Settings',
					accelerator: 'Cmd+,',
					click: () => {
						shell.openItem(store.getPreferencesPath());
					}
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
					role: 'quit'
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
