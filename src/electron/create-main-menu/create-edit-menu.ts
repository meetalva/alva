import * as Electron from 'electron';
import { MessageType } from '../../message';
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
						type: MessageType.Undo,
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
						type: MessageType.Redo
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
						type: MessageType.Cut
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
						type: MessageType.Copy
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
						type: MessageType.Paste
					});
					Electron.Menu.sendActionToFirstResponder('paste:');
				}
			},
			{
				label: '&Paste Inside',
				enabled:
					typeof ctx.project !== 'undefined' &&
					typeof selectedElement !== 'undefined' &&
					selectedElement.acceptsChildren(),
				accelerator: 'CmdOrCtrl+Shift+V',
				click: () => {
					if (typeof selectedElement === 'undefined') {
						return;
					}

					injection.sender.send({
						id: uuid.v4(),
						payload: {
							targetType: Types.ElementTargetType.Inside,
							id: selectedElement.getId()
						},
						type: MessageType.Paste
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
						type: MessageType.Duplicate
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
						type: MessageType.Delete
					});
					Electron.Menu.sendActionToFirstResponder('delete:');
				}
			}
		]
	};
}
