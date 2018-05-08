import { BrowserWindow, ipcRenderer, MenuItem, MenuItemConstructorOptions, remote } from 'electron';
import * as FsExtra from 'fs-extra';
import { HtmlExporter } from '../export/html-exporter';
import { ServerMessageType } from '../message';
import { Page } from '../store/page/page';
import * as Path from 'path';
import { PdfExporter } from '../export/pdf-exporter';
import { PngExporter } from '../export/png-exporter';
import * as Process from 'process';
import { Project } from '../store/project';
import { SketchExporter } from '../export/sketch-exporter';
import { Store } from '../store/store';
const { Menu, shell, app, dialog } = remote;

function getPageFileName(): string {
	return (Store.getInstance().getCurrentPage() as Page).getName();
}

function getProjectFileName(): string {
	return (Store.getInstance().getCurrentProject() as Project).getName();
}

interface PathQuery {
	defaultName: string;
	extname: string;
	title: string;
	typeName: string;
}

// tslint:disable-next-line promise-function-async
function queryPath(options: PathQuery): Promise<string> {
	return new Promise((resolve, reject) => {
		dialog.showSaveDialog(
			{
				title: options.title,
				defaultPath: `${options.defaultName}.${options.extname}`,
				filters: [{ name: options.typeName, extensions: [options.extname] }]
			},
			resolve
		);
	});
}

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
							appPath = Process.cwd();
						}

						const designkitPath = Path.join(appPath, 'build', 'designkit');
						dialog.showOpenDialog(
							{ properties: ['openDirectory', 'createDirectory'] },
							filePaths => {
								if (filePaths.length <= 0) {
									return;
								}

								FsExtra.copySync(designkitPath, Path.join(filePaths[0], 'designkit'));
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
					click: () => store.save()
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
					label: '&Export',
					submenu: [
						{
							label: 'Export Page as Sketch',
							enabled: !isSplashscreen,
							click: async () => {
								const path = await queryPath({
									title: 'Export Sketch as',
									typeName: 'Almost Sketch JSON',
									defaultName: `${getPageFileName()}.asketch`,
									extname: 'json'
								});

								if (path) {
									const sketchExporter = new SketchExporter();
									await sketchExporter.createExport();
									await sketchExporter.writeToDisk(path);
								}
							}
						},
						{
							label: 'Export Page as PDF',
							enabled: !isSplashscreen,
							click: async () => {
								const path = await queryPath({
									title: 'Export PDF as',
									typeName: 'PDF Document',
									defaultName: getPageFileName(),
									extname: 'pdf'
								});

								if (path) {
									const pdfExporter = new PdfExporter();
									await pdfExporter.createExport();
									await pdfExporter.writeToDisk(path);
								}
							}
						},
						{
							label: 'Export Page as PNG',
							enabled: !isSplashscreen,
							click: async () => {
								const path = await queryPath({
									title: 'Export PNG as',
									typeName: 'PNG Image',
									defaultName: getPageFileName(),
									extname: 'png'
								});

								if (path) {
									const pngExporter = new PngExporter();
									await pngExporter.createExport();
									await pngExporter.writeToDisk(path);
								}
							}
						},
						{
							type: 'separator'
						},
						{
							label: 'Export Project as HTML',
							enabled: !isSplashscreen,
							click: async () => {
								const path = await queryPath({
									title: 'Export HTML as',
									typeName: 'HTML File',
									defaultName: getProjectFileName(),
									extname: 'html'
								});

								if (path) {
									const htmlExporter = new HtmlExporter();
									await htmlExporter.createExport();
									await htmlExporter.writeToDisk(path);
								}
							}
						}
					]
				},
				{
					type: 'separator',
					visible: process.platform !== 'darwin'
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
					click: () => ipcRenderer.send('message', { type: ServerMessageType.Undo })
				},
				{
					label: '&Redo',
					accelerator: 'Shift+CmdOrCtrl+Z',
					click: () => ipcRenderer.send('message', { type: ServerMessageType.Redo })
				},
				{
					type: 'separator'
				},
				{
					label: '&Cut',
					enabled: !isSplashscreen,
					accelerator: 'CmdOrCtrl+X',
					click: () => {
						ipcRenderer.send('message', { type: ServerMessageType.Cut });
						Menu.sendActionToFirstResponder('cut:');
					}
				},
				{
					label: 'C&opy',
					enabled: !isSplashscreen,
					accelerator: 'CmdOrCtrl+C',
					click: () => {
						ipcRenderer.send('message', { type: ServerMessageType.Copy });
						Menu.sendActionToFirstResponder('copy:');
					}
				},
				{
					label: '&Paste',
					enabled: !isSplashscreen,
					accelerator: 'CmdOrCtrl+V',
					click: () => {
						ipcRenderer.send('message', { type: ServerMessageType.Paste });
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
						ipcRenderer.send('message', { type: ServerMessageType.Duplicate });
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
						ipcRenderer.send('message', { type: ServerMessageType.Delete });
						remote.Menu.sendActionToFirstResponder('delete:');
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
