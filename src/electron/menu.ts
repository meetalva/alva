import * as Sender from '../message/client';
import { BrowserWindow, MenuItem, MenuItemConstructorOptions, remote } from 'electron';
import { HtmlExporter } from '../export/html-exporter';
import { ServerMessageType } from '../message';
import { Page, Project } from '../model';
import { PdfExporter } from '../export/pdf-exporter';
import { PngExporter } from '../export/png-exporter';
import { SketchExporter } from '../export/sketch-exporter';
import { ViewStore } from '../store';
import * as uuid from 'uuid';

const { Menu, shell, app, dialog } = remote;

function getPageFileName(): string {
	return (ViewStore.getInstance().getCurrentPage() as Page).getName();
}

function getProjectFileName(): string {
	return (ViewStore.getInstance().getProject() as Project).getName();
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
	const store = ViewStore.getInstance();
	const isSplashscreen: boolean = !Boolean(store.getProject());
	const template: MenuItemConstructorOptions[] = [
		{
			label: '&File',
			submenu: [
				{
					label: '&New',
					accelerator: 'CmdOrCtrl+N',
					click: () => {
						Sender.send({
							type: ServerMessageType.CreateNewFileRequest,
							id: uuid.v4(),
							payload: undefined
						});
					}
				},
				{
					label: '&Open',
					accelerator: 'CmdOrCtrl+O',
					click: () => {
						Sender.send({
							type: ServerMessageType.OpenFileRequest,
							id: uuid.v4(),
							payload: undefined
						});
					}
				},
				{
					type: 'separator'
				},
				{
					label: 'New &Page',
					enabled: !isSplashscreen,
					accelerator: 'CmdOrCtrl+Shift+N',
					click: () => {
						Sender.send({
							type: ServerMessageType.CreateNewPage,
							id: uuid.v4(),
							payload: undefined
						});
					}
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
						const project = store.getProject();

						if (!project) {
							return;
						}

						Sender.send({
							type: ServerMessageType.Save,
							id: uuid.v4(),
							payload: {
								path: project.getPath(),
								project: project.toJSON()
							}
						});
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
									sketchExporter.execute(path);
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
									pdfExporter.execute(path);
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
									pngExporter.execute(path);
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
									htmlExporter.execute(path);
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
					click: () =>
						Sender.send({
							id: uuid.v4(),
							type: ServerMessageType.Undo,
							payload: undefined
						})
				},
				{
					label: '&Redo',
					accelerator: 'Shift+CmdOrCtrl+Z',
					click: () =>
						Sender.send({
							id: uuid.v4(),
							payload: undefined,
							type: ServerMessageType.Redo
						})
				},
				{
					type: 'separator'
				},
				{
					label: '&Cut',
					enabled: !isSplashscreen,
					accelerator: 'CmdOrCtrl+X',
					click: () => {
						Sender.send({
							id: uuid.v4(),
							payload: undefined,
							type: ServerMessageType.Cut
						});
						Menu.sendActionToFirstResponder('cut:');
					}
				},
				{
					label: 'C&opy',
					enabled: !isSplashscreen,
					accelerator: 'CmdOrCtrl+C',
					click: () => {
						Sender.send({
							id: uuid.v4(),
							payload: undefined,
							type: ServerMessageType.Copy
						});
						Menu.sendActionToFirstResponder('copy:');
					}
				},
				{
					label: '&Paste',
					enabled: !isSplashscreen,
					accelerator: 'CmdOrCtrl+V',
					click: () => {
						Sender.send({
							id: uuid.v4(),
							payload: undefined,
							type: ServerMessageType.Paste
						});
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
						Sender.send({
							id: uuid.v4(),
							payload: undefined,
							type: ServerMessageType.Duplicate
						});
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
						Sender.send({
							id: uuid.v4(),
							payload: undefined,
							type: ServerMessageType.Delete
						});
						remote.Menu.sendActionToFirstResponder('delete:');
					}
				}
			]
		},
		{
			label: '&Library',
			submenu: [
				{
					label: '&Connect',
					accelerator: 'CmdOrCtrl+Shift+C',
					click: () => {
						const project = store.getProject();

						if (!project) {
							return;
						}

						Sender.send({
							type: ServerMessageType.ConnectPatternLibraryRequest,
							id: uuid.v4(),
							payload: project.getPatternLibrary().toJSON()
						});
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
						Sender.send({
							id: uuid.v4(),
							payload: undefined,
							type: ServerMessageType.CheckForUpdatesRequest
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
