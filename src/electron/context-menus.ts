import { ipcRenderer, MenuItemConstructorOptions, remote } from 'electron';
import { ServerMessageType } from '../message';
import { PageElement } from '../store/page/page-element';
import { Store } from '../store/store';

const store = Store.getInstance();

export function elementMenu(element: PageElement): void {
	const template: MenuItemConstructorOptions[] = [
		{
			label: 'Cut',
			enabled: !element.isRoot(),
			click: () => {
				ipcRenderer.send('message', {
					type: ServerMessageType.CutPageElement,
					payload: element.getId()
				});
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
			}
		},
		{
			type: 'separator'
		},
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
					type: ServerMessageType.PastepageElementInside,
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

	remote.Menu.buildFromTemplate(template).popup();
}
