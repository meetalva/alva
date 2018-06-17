import * as Electron from 'electron';
import { ServerMessageType } from '../../message';
import * as Model from '../../model';
import { Sender } from '../../sender/server';
import * as Types from '../../types';
import * as uuid from 'uuid';

export interface FileMenuInjection {
	sender: Sender;
}

export function createFileMenu(
	ctx: Types.MainMenuContext,
	injection: FileMenuInjection
): Electron.MenuItemConstructorOptions {
	const project = ctx.project ? Model.Project.from(ctx.project) : undefined;
	const activePage = project && project.getPages().find(p => p.getActive());

	return {
		label: '&File',
		submenu: [
			{
				label: '&New',
				accelerator: 'CmdOrCtrl+N',
				click: () => {
					injection.sender.send({
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
					injection.sender.send({
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
					injection.sender.send({
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
					injection.sender.send({
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
				type: 'separator'
			},
			{
				label: '&Export',
				submenu: [
					{
						label: 'Export Page as Sketch',
						enabled: Boolean(activePage),
						click: async () => {
							if (!activePage) {
								return;
							}

							const path = await queryPath({
								title: 'Export Sketch as',
								typeName: 'Almost Sketch JSON',
								defaultName: `${activePage.getName()}.asketch`,
								extname: 'json'
							});

							Electron.dialog.showMessageBox(
								{
									type: 'info',
									message:
										'Before you can open an exported Sketch-File:\n\n(1) Download & Install "Almost Sketch Plugin"\n\n(2) Open Sketch, run "Plugins > From Almost Sketch to Sketch" and select exported file\n\nWe are currently working on a smoother experience.',
									buttons: ['OK', 'Download Plugin']
								},
								response => {
									if (response === 1) {
										Electron.shell.openExternal(
											'https://github.com/brainly/html-sketchapp/releases/latest'
										);
									}
								}
							);

							if (path) {
								injection.sender.send({
									id: uuid.v4(),
									type: ServerMessageType.ExportSketchTask,
									payload: { path }
								});
							}
						}
					},
					{
						label: 'Export Page as PDF',
						enabled: Boolean(activePage),
						click: async () => {
							if (!activePage) {
								return;
							}

							const path = await queryPath({
								title: 'Export PDF as',
								typeName: 'PDF Document',
								defaultName: activePage.getName(),
								extname: 'pdf'
							});

							if (path) {
								// TODO
								// const pdfExporter = new PdfExporter(ctx.store);
								// pdfExporter.execute(path);
							}
						}
					},
					{
						label: 'Export Page as PNG',
						enabled: Boolean(activePage),
						click: async () => {
							if (!activePage) {
								return;
							}

							const path = await queryPath({
								title: 'Export PNG as',
								typeName: 'PNG Image',
								defaultName: activePage.getName(),
								extname: 'png'
							});

							if (path) {
								// TODO
								// const pngExporter = new PngExporter(ctx.store);
								// pngExporter.execute(path);
							}
						}
					},
					{
						type: 'separator'
					},
					{
						label: 'Export Project as HTML',
						enabled: Boolean(activePage),
						click: async () => {
							if (!project) {
								return;
							}

							const path = await queryPath({
								title: 'Export HTML as',
								typeName: 'HTML File',
								defaultName: project.getName(),
								extname: 'html'
							});

							if (path) {
								// TODO
								// const htmlExporter = new HtmlExporter(ctx.store);
								// htmlExporter.execute(path);
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
	};
}

interface PathQuery {
	defaultName: string;
	extname: string;
	title: string;
	typeName: string;
}

function queryPath(options: PathQuery): Promise<string> {
	return new Promise((resolve, reject) => {
		Electron.dialog.showSaveDialog(
			{
				title: options.title,
				defaultPath: `${options.defaultName}.${options.extname}`,
				filters: [{ name: options.typeName, extensions: [options.extname] }]
			},
			resolve
		);
	});
}
