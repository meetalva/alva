import { MenuItemConstructorOptions, remote } from 'electron';
import { ElementLocationCommand } from '../store/command/element-location-command';
import { PageElement } from '../store/page/page-element';
import { Store } from '../store/store';

const store = Store.getInstance();
export function elementMenu(element: PageElement): void {
	const clipboardElement: PageElement | undefined = store.getClipboardElement();

	const template: MenuItemConstructorOptions[] = [
		{
			label: 'Cut Element',
			click: () => {
				store.setClipboardElement(element);
				store.execute(ElementLocationCommand.remove(element));
			}
		},
		{
			label: 'Copy Element',
			click: () => {
				store.setClipboardElement(element);
			}
		},
		{
			label: 'Delete element',
			click: () => {
				store.execute(ElementLocationCommand.remove(element));
			}
		},
		{
			type: 'separator'
		},
		{
			label: 'Paste element below',
			enabled: Boolean(clipboardElement),
			click: () => {
				const newPageElement = clipboardElement && clipboardElement.clone();

				if (newPageElement) {
					store.execute(ElementLocationCommand.addSibling(element, newPageElement));
				}
			}
		},
		{
			label: 'Paste element inside',
			enabled: Boolean(clipboardElement),
			click: () => {
				const newPageElement = clipboardElement && clipboardElement.clone();

				if (newPageElement) {
					store.execute(ElementLocationCommand.addChild(element, newPageElement));
				}
			}
		}
	];

	const menu = remote.Menu.buildFromTemplate(template);
	menu.popup();
}
