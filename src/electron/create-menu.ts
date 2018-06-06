import * as Sender from '../message/client';
import { BrowserWindow, MenuItem, MenuItemConstructorOptions, remote } from 'electron';
import { HtmlExporter } from '../export/html-exporter';
import { ServerMessageType } from '../message';
import { Element, Page, PatternLibrary, Project } from '../model';
import { PdfExporter } from '../export/pdf-exporter';
import { PngExporter } from '../export/png-exporter';
import { SketchExporter } from '../export/sketch-exporter';
import { ViewStore } from '../store';
import * as Types from '../model/types';
import * as uuid from 'uuid';

const { Menu, shell, app, dialog } = remote;

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

export interface MenuContext {
	page?: Page;
	patternLibrary?: PatternLibrary;
	project?: Project;
	selectedElement?: Element;
	store: ViewStore;
}

export function createMenu(ctx: MenuContext): void {
	const project = ctx.project;

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
					enabled: typeof ctx.project !== 'undefined',
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
					enabled: typeof ctx.project !== 'undefined',
					accelerator: 'CmdOrCtrl+S',
					role: 'save',
					click: () => {
						if (!project) {
							return;
						}
						ctx.store.save();
					}
				},
				{
					type: 'separator'
				},
				{
					label: '&Export',
					submenu: [
						{
							label: 'Export Page as Sketch',
							enabled: typeof ctx.page !== 'undefined',
							click: async () => {
								if (!ctx.page) {
									return;
								}

								alert(
									'Before you can open an exported Sketch-File:\n\n(1) Download & Install "Almost Sketch Plugin": https://github.com/brainly/html-sketchapp/releases/latest\n\n(2) Open Sketch, run "Plugins > From Almost Sketch to Sketch" and select exported file\n\nWe are currently working on a smoother experience.'
								);

								const path = await queryPath({
									title: 'Export Sketch as',
									typeName: 'Almost Sketch JSON',
									defaultName: `${ctx.page.getName()}.asketch`,
									extname: 'json'
								});

								if (path) {
									const sketchExporter = new SketchExporter(ctx.store);
									sketchExporter.execute(path);
								}
							}
						},
						{
							label: 'Export Page as PDF',
							enabled: typeof ctx.page !== 'undefined',
							click: async () => {
								if (!ctx.page) {
									return;
								}

								const path = await queryPath({
									title: 'Export PDF as',
									typeName: 'PDF Document',
									defaultName: ctx.page.getName(),
									extname: 'pdf'
								});

								if (path) {
									const pdfExporter = new PdfExporter(ctx.store);
									pdfExporter.execute(path);
								}
							}
						},
						{
							label: 'Export Page as PNG',
							enabled: typeof ctx.page !== 'undefined',
							click: async () => {
								if (!ctx.page) {
									return;
								}

								const path = await queryPath({
									title: 'Export PNG as',
									typeName: 'PNG Image',
									defaultName: ctx.page.getName(),
									extname: 'png'
								});

								if (path) {
									const pngExporter = new PngExporter(ctx.store);
									pngExporter.execute(path);
								}
							}
						},
						{
							type: 'separator'
						},
						{
							label: 'Export Project as HTML',
							enabled: typeof ctx.project !== 'undefined',
							click: async () => {
								if (!ctx.project) {
									return;
								}

								const path = await queryPath({
									title: 'Export HTML as',
									typeName: 'HTML File',
									defaultName: ctx.project.getName(),
									extname: 'html'
								});

								if (path) {
									const htmlExporter = new HtmlExporter(ctx.store);
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
					enabled: typeof ctx.project !== 'undefined',
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
					enabled: typeof ctx.project !== 'undefined',
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
					enabled: typeof ctx.project !== 'undefined',
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
					enabled: typeof ctx.project !== 'undefined',
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
					enabled: typeof ctx.project !== 'undefined',
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
					enabled:
						typeof ctx.selectedElement !== 'undefined' || typeof ctx.page !== 'undefined',
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
					enabled: typeof ctx.project !== 'undefined',
					accelerator: process.platform === 'darwin' ? 'Backspace' : 'Delete',
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
					label: getLibraryLabel(ctx.project),
					enabled: typeof ctx.patternLibrary !== 'undefined',
					accelerator: 'CmdOrCtrl+Shift+C',
					click: () => ctx.store.connectPatternLibrary()
				},
				{
					label: '&Update',
					enabled:
						typeof ctx.patternLibrary !== 'undefined' &&
						ctx.patternLibrary.getState() === Types.PatternLibraryState.Connected,
					accelerator: 'CmdOrCtrl+U',
					click: () => ctx.store.updatePatternLibrary()
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

function getLibraryLabel(project: Project | undefined): string {
	if (!project) {
		return '&Connect';
	}

	const library = project.getPatternLibrary();

	switch (library.getState()) {
		case Types.PatternLibraryState.Pristine:
			return '&Connect';
		case Types.PatternLibraryState.Connected:
			return '&Change';
		case Types.PatternLibraryState.Disconnected:
			return 'Re&connect';
	}
}
