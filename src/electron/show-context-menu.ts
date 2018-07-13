import { Sender } from '../sender/server';
import * as Electron from 'electron';
import { MessageType } from '../message';
import * as Model from '../model';
import * as Types from '../types';
import * as uuid from 'uuid';
import * as Clipboard from './clipboard';

export interface ContextMenuContex {
	sender: Sender;
}

export async function showContextMenu(
	payload: Types.ContextMenuRequestPayload,
	context: ContextMenuContex
): Promise<void> {
	const menu = await createContextMenu(payload, context);
	Electron.Menu.buildFromTemplate(menu).popup({});
}

async function createContextMenu(
	payload: Types.ContextMenuRequestPayload,
	context: ContextMenuContex
): Promise<Electron.MenuItemConstructorOptions[]> {
	switch (payload.menu) {
		case Types.ContextMenuType.ElementMenu:
			return createElementMenu(payload.data, context);
		case Types.ContextMenuType.LayoutMenu:
			return createLayoutMenu(payload.data, context);
	}
}

async function createElementMenu(
	data: Types.ElementContextMenuRequestPayload,
	context: ContextMenuContex
): Promise<Electron.MenuItemConstructorOptions[]> {
	const element = Model.Element.from(data.element, { project: Model.Project.from(data.project) });
	const clipboard = Clipboard.getClipboard();
	const hasElementClipboard = clipboard ? clipboard.payload.type === 'element' : false;

	const defaultPasteItems = [
		{
			label: 'Paste Below',
			accelerator: 'CmdOrCtrl+V',
			enabled: hasElementClipboard && element.getRole() !== Types.ElementRole.Root,
			click: () => {
				context.sender.send({
					id: uuid.v4(),
					type: MessageType.Paste,
					payload: {
						targetType: Types.ElementTargetType.Below,
						id: element.getId()
					}
				});
			}
		},
		{
			label: 'Paste Inside',
			enabled: hasElementClipboard && element.acceptsChildren(),
			click: () => {
				context.sender.send({
					id: uuid.v4(),
					type: MessageType.Paste,
					payload: {
						targetType: Types.ElementTargetType.Inside,
						id: element.getId()
					}
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
					type: MessageType.DuplicateElement,
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
					type: MessageType.CutElement,
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
					type: MessageType.CopyElement,
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
					type: MessageType.DeleteElement,
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
					type: MessageType.SetPane
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
					type: MessageType.SetPane
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
					type: MessageType.SetPane
				})
		}
	];
}
