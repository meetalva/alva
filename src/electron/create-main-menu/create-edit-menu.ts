import * as Electron from 'electron';
import { ServerMessageType } from '../../message';
import * as Model from '../../model';
import { Sender } from '../../sender/server';
import * as Types from '../../types';
import * as uuid from 'uuid';

export interface EditMenuInjection {
	sender: Sender;
}

export function createEditMenu(
	ctx: Types.MainMenuContext,
	injection: EditMenuInjection
): Electron.MenuItemConstructorOptions {
	const project = ctx.project ? Model.Project.from(ctx.project) : undefined;
	const activePage = project && project.getPages().find(p => p.getActive());
	const selectedElement = project && project.getElements().find(e => e.getSelected());

	return {
		label: '&Edit',
		submenu: [
			{
				label: '&Undo',
				accelerator: 'CmdOrCtrl+Z',
				enabled: typeof ctx.project !== 'undefined',
				click: () =>
					injection.sender.send({
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
					injection.sender.send({
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
					injection.sender.send({
						id: uuid.v4(),
						payload: undefined,
						type: ServerMessageType.Cut
					});
					Electron.Menu.sendActionToFirstResponder('cut:');
				}
			},
			{
				label: 'C&opy',
				enabled: typeof ctx.project !== 'undefined',
				accelerator: 'CmdOrCtrl+C',
				click: () => {
					injection.sender.send({
						id: uuid.v4(),
						payload: undefined,
						type: ServerMessageType.Copy
					});
					Electron.Menu.sendActionToFirstResponder('copy:');
				}
			},
			{
				label: '&Paste',
				enabled: typeof ctx.project !== 'undefined',
				accelerator: 'CmdOrCtrl+V',
				click: () => {
					injection.sender.send({
						id: uuid.v4(),
						payload: undefined,
						type: ServerMessageType.Paste
					});
					Electron.Menu.sendActionToFirstResponder('paste:');
				}
			},
			{
				type: 'separator'
			},
			{
				label: '&Duplicate',
				enabled: typeof selectedElement !== 'undefined' || typeof activePage !== 'undefined',
				accelerator: 'CmdOrCtrl+D',
				click: () => {
					injection.sender.send({
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
					injection.sender.send({
						id: uuid.v4(),
						payload: undefined,
						type: ServerMessageType.Delete
					});
					Electron.Menu.sendActionToFirstResponder('delete:');
				}
			}
		]
	};
}
