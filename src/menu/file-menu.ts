import * as Types from '../types';
import { MessageType } from '../message';
import * as uuid from 'uuid';

const ids = {
	file: uuid.v4(),
	new: uuid.v4(),
	open: uuid.v4(),
	newPage: uuid.v4(),
	save: uuid.v4(),
	saveAs: uuid.v4(),
	exportHTML: uuid.v4(),
	close: uuid.v4()
};

export const fileMenu = (ctx: Types.MenuContext): Types.MenuItem => {
	const hasProject = typeof ctx.project !== 'undefined';
	const onDetailView = ctx.app && ctx.app.isActiveView(Types.AlvaView.PageDetail);
	const isLocal = ctx.app && !ctx.app.isHostType(Types.HostType.RemoteServer);
	const isElectron = ctx.app && ctx.app.isHostType(Types.HostType.LocalElectron);

	return {
		id: ids.file,
		label: '&File',
		submenu: [
			{
				id: ids.new,
				label: '&New',
				accelerator: 'CmdOrCtrl+N',
				click: sender => {
					sender.send({
						type: MessageType.CreateNewFileRequest,
						id: uuid.v4(),
						payload: undefined
					});
				}
			},
			{
				id: ids.open,
				label: '&Open',
				accelerator: 'CmdOrCtrl+O',
				click: sender => {
					sender.send({
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
				id: ids.newPage,
				label: 'New &Page',
				enabled: hasProject && onDetailView,
				accelerator: 'CmdOrCtrl+Shift+N',
				click: sender => {
					sender.send({
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
				id: ids.save,
				label: '&Save',
				enabled: hasProject && onDetailView,
				accelerator: 'CmdOrCtrl+S',
				visible: isLocal,
				role: 'save',
				click: sender => {
					if (!ctx.project) {
						return;
					}

					sender.send({
						type: MessageType.Save,
						id: uuid.v4(),
						payload: { publish: ctx.project.getDraft() }
					});
				}
			},
			{
				id: ids.saveAs,
				label: '&Save As',
				enabled: hasProject && onDetailView,
				accelerator: 'CmdOrCtrl+Shift+S',
				role: 'save',
				click: async sender => {
					if (!ctx.project) {
						return;
					}

					sender.send({
						type: MessageType.Save,
						id: uuid.v4(),
						payload: { publish: true }
					});
				}
			},
			{
				type: 'separator'
			},
			{
				id: ids.exportHTML,
				label: 'Export Prototype as HTML',
				enabled: onDetailView && hasProject,
				accelerator: 'CmdOrCtrl+E',
				click: async sender => {
					if (!ctx.project) {
						return;
					}

					sender.send({
						id: uuid.v4(),
						type: MessageType.ExportHtmlProject,
						payload: { path: undefined }
					});
				}
			},
			{
				type: 'separator',
				visible: isElectron
			},
			{
				id: ids.close,
				label: '&Close',
				accelerator: 'CmdOrCtrl+W',
				role: 'close',
				visible: isElectron,
				click: async () => {
					if (!ctx.project) {
						return;
					}

					// TODO: Send CloseProject message
				}
			}
		]
	};
};
