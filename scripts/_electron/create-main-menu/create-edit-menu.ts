import * as Electron from 'electron';
import { MessageType } from '../../message';
import { Sender } from '../../sender/server';
// import * as Types from '../../types';
// import { MainMenuContext } from '.';
import * as uuid from 'uuid';

export interface EditMenuInjection {
	sender: Sender;
}

export function createEditMenu(
	_: unknown,
	injection: EditMenuInjection
): Electron.MenuItemConstructorOptions {
	// 	const selectedElement = project ? project.getElements().find(e => e.getSelected()) : undefined;
	// 	const activePage = project ? project.getPages().find(p => p.getActive()) : undefined;

	return {
		label: 'Edit',
		role: 'edit',
		submenu: [
			{
				label: '&Undo',
				accelerator: 'CmdOrCtrl+Z',
				// 				enabled: typeof project !== 'undefined',
				click: () => {
					// 					if (app.getHasFocusedInput()) {
					// 						return Electron.Menu.sendActionToFirstResponder('redo:');
					// 					}
					//
					// 					injection.sender.send({
					// 						id: uuid.v4(),
					// 						type: MessageType.Undo,
					// 						payload: undefined
					// 					});
				}
			},
			{
				label: '&Redo',
				accelerator: 'Shift+CmdOrCtrl+Z',
				// 				enabled: typeof project !== 'undefined',
				click: () => {
					// 					if (app.getHasFocusedInput()) {
					// 						return Electron.Menu.sendActionToFirstResponder('redo:');
					// 					}
					//
					// 					injection.sender.send({
					// 						id: uuid.v4(),
					// 						payload: undefined,
					// 						type: MessageType.Redo
					// 					});
				}
			},
			{
				type: 'separator'
			},
			{
				label: '&Cut',
				// 				enabled: typeof project !== 'undefined',
				accelerator: 'CmdOrCtrl+X',
				click: () => {
					// 					if (app.getHasFocusedInput()) {
					// 						return Electron.Menu.sendActionToFirstResponder('cut:');
					// 					}
					//
					// 					injection.sender.send({
					// 						id: uuid.v4(),
					// 						payload: undefined,
					// 						type: MessageType.Cut
					// 					});
				}
			},
			{
				label: 'C&opy',
				// 				enabled: typeof project !== 'undefined',
				accelerator: 'CmdOrCtrl+C',
				click: () => {
					// 					if (app.getHasFocusedInput()) {
					// 						return Electron.Menu.sendActionToFirstResponder('copy:');
					// 					}
					//
					// 					injection.sender.send({
					// 						id: uuid.v4(),
					// 						payload: undefined,
					// 						type: MessageType.Copy
					// 					});
				}
			},
			{
				label: '&Paste',
				// 				enabled: typeof project !== 'undefined',
				accelerator: 'CmdOrCtrl+V',
				click: () => {
					// 					if (app.getHasFocusedInput()) {
					// 						return Electron.Menu.sendActionToFirstResponder('paste:');
					// 					}
					//
					// 					injection.sender.send({
					// 						id: uuid.v4(),
					// 						payload: undefined,
					// 						type: MessageType.Paste
					// 					});
				}
			},
			{
				label: '&Paste Inside',
				//  				enabled:
				// 					!app.getHasFocusedInput() &&
				// 					typeof project !== 'undefined' &&
				// 					typeof selectedElement !== 'undefined' &&
				// 					selectedElement.acceptsChildren(),
				accelerator: 'CmdOrCtrl+Shift+V',
				click: () => {
					// 					if (typeof selectedElement === 'undefined') {
					// 						return;
					// 					}
					//
					// 					injection.sender.send({
					// 						id: uuid.v4(),
					// 						payload: {
					// 							targetType: Types.ElementTargetType.Inside,
					// 							id: selectedElement.getId()
					// 						},
					// 						type: MessageType.Paste
					// 					});
				}
			},
			{
				type: 'separator'
			},
			{
				label: '&Duplicate',
				// 				enabled:
				// 					typeof selectedElement !== 'undefined' ||
				// 					(typeof activePage !== 'undefined' && !app.getHasFocusedInput()),
				accelerator: 'CmdOrCtrl+D',
				click: () => {
					injection.sender.send({
						id: uuid.v4(),
						payload: undefined,
						type: MessageType.DuplicateSelected
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
				// 				enabled: typeof project !== 'undefined',
				accelerator: process.platform === 'darwin' ? 'Backspace' : 'Delete',
				click: () => {
					// 					if (app.getHasFocusedInput()) {
					// 						return Electron.Menu.sendActionToFirstResponder('delete:');
					// 					}
					// 					injection.sender.send({
					// 						id: uuid.v4(),
					// 						payload: undefined,
					// 						type: MessageType.DeleteSelected
					// 					});
				}
			}
		]
	};
}
