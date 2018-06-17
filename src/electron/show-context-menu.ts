import { Sender } from '../sender/server';
import * as Electron from 'electron';
import { ServerMessageType } from '../message';
import * as Model from '../model';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface ContextMenuContex {
	sender: Sender;
}

export function showContextMenu(
	payload: Types.ContextMenuRequestPayload,
	context: ContextMenuContex
): void {
	const menu = createContextMenu(payload, context);
	Electron.Menu.buildFromTemplate(menu).popup({});
}

function createContextMenu(
	payload: Types.ContextMenuRequestPayload,
	context: ContextMenuContex
): Electron.MenuItemConstructorOptions[] {
	switch (payload.menu) {
		case Types.ContextMenuType.ElementMenu:
			return createElementMenu(payload.data, context);
		case Types.ContextMenuType.LayoutMenu:
			return createLayoutMenu(payload.data, context);
	}
}

function createElementMenu(
	data: Types.ElementContextMenuRequestPayload,
	context: ContextMenuContex
): Electron.MenuItemConstructorOptions[] {
	const element = Model.Element.from(data.element, { project: Model.Project.from(data.project) });

	const defaultPasteItems = [
		{
			label: 'Paste Below',
			accelerator: 'CmdOrCtrl+C',
			enabled: data.clipboardItem && element.getRole() !== Types.ElementRole.Root,
			click: () => {
				context.sender.send({
					id: uuid.v4(),
					type: ServerMessageType.PasteElementBelow,
					payload: element.getId()
				});
			}
		},
		{
			label: 'Paste Inside',
			enabled: data.clipboardItem && element.acceptsChildren(),
			click: () => {
				context.sender.send({
					id: uuid.v4(),
					type: ServerMessageType.PasteElementInside,
					payload: element.getId()
				});
			}
		},
		{
			label: 'Duplicate',
			accelerator: 'CmdOrCtrl+D',
			enabled: element.getRole() !== Types.ElementRole.Root,
			click: () => {
				context.sender.send({
					id: uuid.v4(),
					type: ServerMessageType.DuplicateElement,
					payload: element.getId()
				});
			}
		}
	];

	return [
		{
			label: 'Cut',
			accelerator: 'CmdOrCtrl+X',
			enabled: element.getRole() !== Types.ElementRole.Root,
			click: () => {
				context.sender.send({
					id: uuid.v4(),
					type: ServerMessageType.CutElement,
					payload: element.getId()
				});
				Electron.Menu.sendActionToFirstResponder('cut:');
			}
		},
		{
			label: 'Copy',
			accelerator: 'CmdOrCtrl+C',
			enabled: element.getRole() !== Types.ElementRole.Root,
			click: () => {
				context.sender.send({
					id: uuid.v4(),
					type: ServerMessageType.CopyElement,
					payload: element.getId()
				});
				Electron.Menu.sendActionToFirstResponder('copy:');
			}
		},
		{
			label: 'Delete',
			accelerator: process.platform === 'darwin' ? 'Backspace' : 'Delete',
			enabled: element.getRole() !== Types.ElementRole.Root,
			click: () => {
				context.sender.send({
					id: uuid.v4(),
					type: ServerMessageType.DeleteElement,
					payload: element.getId()
				});
				Electron.Menu.sendActionToFirstResponder('delete:');
			}
		},
		{
			type: 'separator'
		},
		// TODO: Find out why pasting via sendActionToFirstResponder
		// sets the caret to position 0 and overwrites the entire input
		/* {
			label: 'Paste',
			click: () => {
				remote.Menu.sendActionToFirstResponder('paste:');
			}
		} */
		...(!element.getNameEditable() ? defaultPasteItems : [])
	];
}

function createLayoutMenu(
	data: {
		app: Types.SerializedAlvaApp;
	},
	context: ContextMenuContex
): Electron.MenuItemConstructorOptions[] {
	const app = Model.AlvaApp.from(data.app);

	return [
		{
			label: 'Pages',
			type: 'checkbox',
			checked: app.getPanes().has(Types.AppPane.PagesPane),
			enabled: app.getActiveView() === Types.AlvaView.PageDetail,
			click: () =>
				context.sender.send({
					id: uuid.v4(),
					payload: {
						pane: Types.AppPane.PagesPane,
						visible: !app.getPanes().has(Types.AppPane.PagesPane)
					},
					type: ServerMessageType.SetPane
				})
		},
		{
			label: 'Elements',
			type: 'checkbox',
			checked: app.getPanes().has(Types.AppPane.ElementsPane),
			enabled: app.getActiveView() === Types.AlvaView.PageDetail,
			click: () =>
				context.sender.send({
					id: uuid.v4(),
					payload: {
						pane: Types.AppPane.ElementsPane,
						visible: !app.getPanes().has(Types.AppPane.ElementsPane)
					},
					type: ServerMessageType.SetPane
				})
		},
		{
			label: 'Properties',
			type: 'checkbox',
			checked: app.getPanes().has(Types.AppPane.PropertiesPane),
			enabled: app.getActiveView() === Types.AlvaView.PageDetail,
			click: () =>
				context.sender.send({
					id: uuid.v4(),
					payload: {
						pane: Types.AppPane.PropertiesPane,
						visible: !app.getPanes().has(Types.AppPane.PropertiesPane)
					},
					type: ServerMessageType.SetPane
				})
		}
	];
}
