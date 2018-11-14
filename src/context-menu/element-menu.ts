import * as uuid from 'uuid';
import { MessageType as M } from '../message';
import * as Types from '../types';

const ids = {
	cut: uuid.v4(),
	copy: uuid.v4(),
	paste: uuid.v4(),
	pasteBelow: uuid.v4(),
	pasteInside: uuid.v4(),
	duplicate: uuid.v4(),
	selectAll: uuid.v4(),
	delete: uuid.v4(),
	sep: uuid.v4()
};

export const elementContextMenu = (ctx: Types.ElementMenuContext): Types.ContextMenuItem[] => {
	const defaultPasteItems = [
		{
			id: ids.pasteBelow,
			label: 'Paste Below',
			accelerator: 'CmdOrCtrl+V',
			enabled: ctx.element.getRole() !== Types.ElementRole.Root,
			click: sender => {
				sender.send({
					id: uuid.v4(),
					type: M.Paste,
					payload: {
						targetType: Types.ElementTargetType.Below,
						id: ctx.element.getId()
					}
				});
			}
		},
		{
			id: ids.pasteInside,
			label: 'Paste Inside',
			enabled: ctx.element.acceptsChildren(),
			click: sender => {
				sender.send({
					id: uuid.v4(),
					type: M.Paste,
					payload: {
						targetType: Types.ElementTargetType.Inside,
						id: ctx.element.getId()
					}
				});
			}
		},
		{
			id: ids.duplicate,
			label: 'Duplicate',
			accelerator: 'CmdOrCtrl+D',
			enabled: ctx.element.getRole() !== Types.ElementRole.Root,
			click: sender => {
				sender.send({
					id: uuid.v4(),
					type: M.DuplicateElement,
					payload: ctx.element.getId()
				});
			}
		}
	];

	return [
		{
			id: ids.cut,
			label: 'Cut',
			accelerator: 'CmdOrCtrl+X',
			enabled: ctx.element.getRole() !== Types.ElementRole.Root,
			click: sender => {
				sender.send({
					id: uuid.v4(),
					type: M.CutElement,
					payload: ctx.element.getId()
				});
				// Electron.Menu.sendActionToFirstResponder('cut:');
			}
		},
		{
			id: ids.copy,
			label: 'Copy',
			accelerator: 'CmdOrCtrl+C',
			enabled: ctx.element.getRole() !== Types.ElementRole.Root,
			click: sender => {
				sender.send({
					id: uuid.v4(),
					type: M.CopyElement,
					payload: ctx.element.getId()
				});
				Electron.Menu.sendActionToFirstResponder('copy:');
			}
		},
		{
			id: ids.delete,
			label: 'Delete',
			accelerator: 'Backspace',
			enabled: ctx.element.getRole() !== Types.ElementRole.Root,
			click: sender => {
				sender.send({
					id: uuid.v4(),
					type: M.DeleteElement,
					payload: ctx.element.getId()
				});
				// Electron.Menu.sendActionToFirstResponder('delete:');
			}
		},
		{
			id: ids.sep,
			type: 'separator'
		},
		...(!ctx.element.getNameEditable() ? defaultPasteItems : [])
	];
};
