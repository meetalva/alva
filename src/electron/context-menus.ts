import { ipcRenderer, MenuItemConstructorOptions, remote } from 'electron';
import { ServerMessageType } from '../message';
import { PageElement } from '../store/page/page-element';
import { ViewStore } from '../store';

const store = ViewStore.getInstance();

export function elementMenu(element: PageElement): void {
	const defaultPasteItems = [
		{
			label: 'Paste Below',
			enabled: store.hasApplicableClipboardItem() && !element.isRoot(),
			click: () => {
				ipcRenderer.send('message', {
					type: ServerMessageType.PastePageElementBelow,
					payload: element.getId()
				});
			}
		},
		{
			label: 'Paste Inside',
			enabled: store.hasApplicableClipboardItem(),
			click: () => {
				ipcRenderer.send('message', {
					type: ServerMessageType.PastePageElementInside,
					payload: element.getId()
				});
			}
		},
		{
			label: 'Duplicate',
			enabled: !element.isRoot(),
			click: () => {
				ipcRenderer.send('message', {
					type: ServerMessageType.DuplicatePageElement,
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
				ipcRenderer.send('message', {
					type: ServerMessageType.CutPageElement,
					payload: element.getId()
				});
				remote.Menu.sendActionToFirstResponder('cut:');
			}
		},
		{
			label: 'Copy',
			enabled: !element.isRoot(),
			click: () => {
				ipcRenderer.send('message', {
					type: ServerMessageType.CopyPageElement,
					payload: element.getId()
				});
				remote.Menu.sendActionToFirstResponder('copy:');
			}
		},
		{
			label: 'Delete',
			enabled: !element.isRoot(),
			click: () => {
				ipcRenderer.send('message', {
					type: ServerMessageType.DeletePageElement,
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
