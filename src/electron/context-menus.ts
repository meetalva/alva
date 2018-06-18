import * as Sender from '../message/client';
import { MenuItemConstructorOptions, remote } from 'electron';
import { ServerMessageType } from '../message';
import { Element } from '../model';
import { ViewStore } from '../store';
import * as Types from '../types';
import * as uuid from 'uuid';

export function elementMenu(element: Element, store: ViewStore): void {
	const defaultPasteItems = [
		{
			label: 'Paste Below',
			enabled:
				store.hasApplicableClipboardItem() && element.getRole() !== Types.ElementRole.Root,
			click: () => {
				Sender.send({
					id: uuid.v4(),
					type: ServerMessageType.PasteElementBelow,
					payload: element.getId()
				});
			}
		},
		{
			label: 'Paste Inside',
			enabled: store.hasApplicableClipboardItem() && element.acceptsChildren(),
			click: () => {
				Sender.send({
					id: uuid.v4(),
					type: ServerMessageType.PasteElementInside,
					payload: element.getId()
				});
			}
		},
		{
			label: 'Duplicate',
			enabled: element.getRole() !== Types.ElementRole.Root,
			click: () => {
				Sender.send({
					id: uuid.v4(),
					type: ServerMessageType.DuplicateElement,
					payload: element.getId()
				});
			}
		}
	];

	const template: MenuItemConstructorOptions[] = [
		{
			label: 'Cut',
			enabled: element.getRole() !== Types.ElementRole.Root,
			click: () => {
				Sender.send({
					id: uuid.v4(),
					type: ServerMessageType.CutElement,
					payload: element.getId()
				});
				remote.Menu.sendActionToFirstResponder('cut:');
			}
		},
		{
			label: 'Copy',
			enabled: element.getRole() !== Types.ElementRole.Root,
			click: () => {
				Sender.send({
					id: uuid.v4(),
					type: ServerMessageType.CopyElement,
					payload: element.getId()
				});
				remote.Menu.sendActionToFirstResponder('copy:');
			}
		},
		{
			label: 'Delete',
			enabled: element.getRole() !== Types.ElementRole.Root,
			click: () => {
				Sender.send({
					id: uuid.v4(),
					type: ServerMessageType.DeleteElement,
					payload: element.getId()
				});
				remote.Menu.sendActionToFirstResponder('delete:');
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

	remote.Menu.buildFromTemplate(template).popup({});
}

export function layoutMenu(store: ViewStore): void {
	const template: MenuItemConstructorOptions[] = [
		{
			label: 'Pages',
			type: 'checkbox',
			checked: store.getShowPages(),
			enabled: store.getActiveAppView() === Types.AlvaView.PageDetail,
			click: (item, checked) => {
				store.setShowPages(item.checked);
			}
		},
		{
			label: 'Elements',
			type: 'checkbox',
			checked: store.getShowLeftSidebar(),
			enabled: store.getActiveAppView() === Types.AlvaView.PageDetail,
			click: (item, checked) => {
				store.setShowLeftSidebar(item.checked);
			}
		},
		{
			label: 'Properties',
			type: 'checkbox',
			checked: store.getShowRightSidebar(),
			enabled: store.getActiveAppView() === Types.AlvaView.PageDetail,
			click: (item, checked) => {
				store.setShowRightSidebar(item.checked);
			}
		}
	];

	remote.Menu.buildFromTemplate(template).popup({});
}
