import * as Electron from 'electron';
import { MainMenuContext } from '.';
import { MessageType } from '../../message';
import { Sender } from '../../sender/server';
import * as uuid from 'uuid';

export interface FileMenuInjection {
	sender: Sender;
}

export function createFileMenu(
	ctx: MainMenuContext,
	injection: FileMenuInjection
): Electron.MenuItemConstructorOptions {
	const activePage = ctx.project && ctx.project.getPages().find(p => p.getActive());

	return {
		label: '&File',
		submenu: [
			{
				label: '&New',
				accelerator: 'CmdOrCtrl+N',
				click: () => {
					injection.sender.send({
						type: MessageType.CreateNewFileRequest,
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
						type: MessageType.OpenFileRequest,
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
						type: MessageType.CreateNewPage,
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
				click: async () => {
					injection.sender.send({
						type: MessageType.Save,
						id: uuid.v4(),
						payload: undefined
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

							injection.sender.send({
								id: uuid.v4(),
								type: MessageType.ExportSketchPage,
								payload: { path: undefined }
							});
						}
					},
					{
						label: 'Export Page as PNG',
						enabled: Boolean(activePage),
						click: async () => {
							if (!activePage) {
								return;
							}

							injection.sender.send({
								id: uuid.v4(),
								type: MessageType.ExportPngPage,
								payload: { path: undefined }
							});
						}
					},
					{
						type: 'separator'
					},
					{
						label: 'Export Project as HTML',
						enabled: Boolean(activePage),
						accelerator: 'CmdOrCtrl+Shift+E',
						click: async () => {
							if (!ctx.project) {
								return;
							}

							injection.sender.send({
								id: uuid.v4(),
								type: MessageType.ExportHtmlProject,
								payload: { path: undefined }
							});
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
