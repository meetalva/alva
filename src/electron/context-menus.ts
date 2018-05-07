import { ipcRenderer, MenuItemConstructorOptions, remote } from 'electron';
import { ServerMessageType } from '../message';
import { PageElement } from '../store/page/page-element';
import { Store } from '../store/store';

const store = Store.getInstance();

export function elementMenu(element: PageElement): void {
	const template: MenuItemConstructorOptions[] = [
		{
			label: 'Cut Element',
			click: () => {
				ipcRenderer.send('message', {
					type: ServerMessageType.CutPageElement,
					payload: element.getId()
				});
			}
		},
		{
			label: 'Copy Element',
			click: () => {
				ipcRenderer.send('message', {
					type: ServerMessageType.CopyPageElement,
					payload: element.getId()
				});
			}
		},
		{
			label: 'Delete element',
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
			label: 'Paste element below',
			enabled: store.hasApplicableClipboardItem(),
			click: () => {
				ipcRenderer.send('message', {
					type: ServerMessageType.PastePageElementBelow,
					payload: element.getId()
				});
			}
		},
		{
			label: 'Paste element inside',
			enabled: store.hasApplicableClipboardItem(),
			click: () => {
				ipcRenderer.send('message', {
					type: ServerMessageType.PastepageElementInside,
					payload: element.getId()
				});
			}
		}
	];

	remote.Menu.buildFromTemplate(template).popup();
}
