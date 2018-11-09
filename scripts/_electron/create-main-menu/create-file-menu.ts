import * as Electron from 'electron';
import { MainMenuContext } from '.';
import { MessageType } from '../../message';
import { Sender } from '../../sender/server';
import * as uuid from 'uuid';
// import * as Types from '../../types';

export interface FileMenuInjection {
	sender: Sender;
}

export function createFileMenu(
	ctx: MainMenuContext,
	injection: FileMenuInjection
): Electron.MenuItemConstructorOptions {
	// 	const activePage = ctx.project && ctx.project.getPages().find(p => p.getActive());
	// 	const hasPage = typeof activePage !== 'undefined';
	// 	const hasProject = typeof ctx.project !== 'undefined';
	// 	const onDetailView = ctx.app.getActiveView() !== Types.AlvaView.SplashScreen;

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
				// 				enabled: hasProject && onDetailView,
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
				// 				enabled: hasProject && onDetailView,
				accelerator: 'CmdOrCtrl+S',
				role: 'save',
				click: async () => {
					// 					if (!ctx.project) {
					// 						return;
					// 					}
					//
					// 					injection.sender.send({
					// 						type: MessageType.Save,
					// 						id: uuid.v4(),
					// 						payload: { publish: ctx.project.getDraft() }
					// 					});
				}
			},
			{
				label: '&Save As',
				// 				enabled: hasProject && onDetailView,
				accelerator: 'CmdOrCtrl+Shift+S',
				role: 'save',
				click: async () => {
					// 					if (!ctx.project) {
					// 						return;
					// 					}
					//
					// 					injection.sender.send({
					// 						type: MessageType.Save,
					// 						id: uuid.v4(),
					// 						payload: { publish: true }
					// 					});
				}
			},
			{
				type: 'separator'
			},
			{
				label: 'Export Prototype as HTML',
				// 				enabled: hasPage && onDetailView,
				accelerator: 'CmdOrCtrl+E',
				click: async () => {
					// 					if (!ctx.project) {
					// 						return;
					// 					}
					//
					// 					injection.sender.send({
					// 						id: uuid.v4(),
					// 						type: MessageType.ExportHtmlProject,
					// 						payload: { path: undefined }
					// 					});
				}
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
