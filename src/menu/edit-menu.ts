import { MessageType } from '../message';
import * as uuid from 'uuid';
import * as Types from '../types';

const ids = {
	edit: uuid.v4(),
	undo: uuid.v4(),
	redo: uuid.v4(),
	cut: uuid.v4(),
	copy: uuid.v4(),
	paste: uuid.v4(),
	pasteInside: uuid.v4(),
	duplicate: uuid.v4(),
	selectAll: uuid.v4(),
	delete: uuid.v4()
};

export const editMenu = (ctx: Types.MenuContext): Types.MenuItem => {
	const isElectron = ctx.app && ctx.app.isHostType(Types.HostType.Electron);
	const hasBrowserClipboard = typeof (navigator as any).clipboard !== 'undefined';
	const hasClipboard = isElectron || hasBrowserClipboard;

	return {
		label: 'Edit',
		role: 'edit',
		id: ids.edit,
		submenu: [
			{
				id: ids.undo,
				label: '&Undo',
				accelerator: 'CmdOrCtrl+Z',
				enabled: typeof ctx.project !== 'undefined',
				click: sender => {
					// TODO: Move into Electron host adapter
					// if (app.getHasFocusedInput()) {
					// 	return Electron.Menu.sendActionToFirstResponder('undo:');
					// }
					sender.send({
						id: uuid.v4(),
						type: MessageType.Undo,
						payload: undefined
					});
				}
			},
			{
				id: ids.redo,
				label: '&Redo',
				accelerator: 'Shift+CmdOrCtrl+Z',
				enabled: typeof ctx.project !== 'undefined',
				click: sender => {
					// TODO: Move into Electron host adapter
					// if (app.getHasFocusedInput()) {
					// 	return Electron.Menu.sendActionToFirstResponder('redo:');
					// }
					//
					sender.send({
						id: uuid.v4(),
						payload: undefined,
						type: MessageType.Redo
					});
				}
			},
			{
				id: uuid.v4(),
				type: 'separator'
			},
			{
				id: ids.cut,
				label: '&Cut',
				enabled: typeof ctx.project !== 'undefined' && hasClipboard,
				accelerator: 'CmdOrCtrl+X',
				click: sender => {
					// TODO: Move into Electron host adapter
					// if (app.getHasFocusedInput()) {
					// 	return Electron.Menu.sendActionToFirstResponder('cut:');
					// }
					//
					sender.send({
						id: uuid.v4(),
						payload: undefined,
						type: MessageType.Cut
					});
				}
			},
			{
				id: ids.copy,
				label: 'C&opy',
				enabled: typeof ctx.project !== 'undefined' && hasClipboard,
				accelerator: 'CmdOrCtrl+C',
				click: sender => {
					// TODO: Move into Electron host adapter
					// if (app.getHasFocusedInput()) {
					// 	return Electron.Menu.sendActionToFirstResponder('copy:');
					// }

					if (!ctx.project) {
						return;
					}

					const item = ctx.project.getFocusedItem();
					const itemType = ctx.project.getFocusedItemType();

					if (!item) {
						return;
					}

					sender.send({
						id: uuid.v4(),
						payload: {
							itemId: item.getId(),
							itemType,
							projectId: ctx.project.getId()
						},
						type: MessageType.Copy
					});
				}
			},
			{
				id: ids.paste,
				label: '&Paste',
				enabled: typeof ctx.project !== 'undefined' && hasClipboard,
				accelerator: 'CmdOrCtrl+V',
				click: sender => {
					// TODO: Move into Electron host adapter
					// if (app.getHasFocusedInput()) {
					// 	return Electron.Menu.sendActionToFirstResponder('paste:');
					// }
					//
					sender.send({
						id: uuid.v4(),
						payload: undefined,
						type: MessageType.Paste
					});
				}
			},
			{
				id: ids.pasteInside,
				label: '&Paste Inside',
				enabled:
					hasClipboard &&
					ctx.app &&
					!ctx.app.getHasFocusedInput() &&
					ctx.project &&
					ctx.project.getSelectedElement(),
				accelerator: 'CmdOrCtrl+Shift+V',
				click: sender => {
					const selectedElement = ctx.project && ctx.project.getSelectedElement();

					if (!selectedElement) {
						return;
					}

					sender.send({
						id: uuid.v4(),
						payload: {
							targetType: Types.ElementTargetType.Inside,
							id: selectedElement.getId()
						},
						type: MessageType.Paste
					});
				}
			},
			{
				id: uuid.v4(),
				type: 'separator'
			},
			{
				id: ids.duplicate,
				label: '&Duplicate',
				// 				enabled:
				// 					typeof selectedElement !== 'undefined' ||
				// 					(typeof activePage !== 'undefined' && !app.getHasFocusedInput()),
				accelerator: 'CmdOrCtrl+D',
				click: sender => {
					sender.send({
						id: uuid.v4(),
						payload: undefined,
						type: MessageType.DuplicateSelected
					});
				}
			},
			{
				id: uuid.v4(),
				type: 'separator'
			},
			{
				id: ids.selectAll,
				label: '&Select All',
				accelerator: 'CmdOrCtrl+A',
				role: 'selectall'
			},
			{
				id: uuid.v4(),
				type: 'separator'
			},
			{
				id: ids.delete,
				label: '&Delete',
				enabled: typeof ctx.project !== 'undefined',
				accelerator: process.platform === 'darwin' ? 'Backspace' : 'Delete',
				click: sender => {
					// TODO: Move to Electron Host Adapter
					// if (app.getHasFocusedInput()) {
					// 	return Electron.Menu.sendActionToFirstResponder('delete:');
					// }
					sender.send({
						id: uuid.v4(),
						payload: undefined,
						type: MessageType.DeleteSelected
					});
				}
			}
		]
	};
};
