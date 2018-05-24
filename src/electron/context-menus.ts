import * as Sender from '../message/client';
import { MenuItemConstructorOptions, remote } from 'electron';
import { ServerMessageType } from '../message';
import { Element } from '../model';
import { ViewStore } from '../store';
import * as uuid from 'uuid';

const store = ViewStore.getInstance();

export function elementMenu(element: Element): void {
	const defaultPasteItems = [
		{
			label: 'Paste Below',
			enabled: store.hasApplicableClipboardItem() && !element.isRoot(),
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
			enabled: store.hasApplicableClipboardItem(),
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
			enabled: !element.isRoot(),
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
			enabled: !element.isRoot(),
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
			enabled: !element.isRoot(),
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
			enabled: !element.isRoot(),
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
		...(!element.isNameEditable() ? defaultPasteItems : [])
	];

	remote.Menu.buildFromTemplate(template).popup();
}
