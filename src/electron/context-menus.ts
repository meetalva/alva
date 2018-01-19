import { MenuItemConstructorOptions, remote } from 'electron';
import { PageElement } from '../store/page/page-element';
import { Store } from '../store/store';
const { Menu } = remote;

export function elementMenu(store: Store, element: PageElement): void {
	const clipboardElement: PageElement | undefined = store.getClipboardElement();

	const template: MenuItemConstructorOptions[] = [
		{
			label: 'Cut Element',
			click: () => {
				store.setClipboardElement(element);
				element.remove();
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
				element.remove();
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
					element.addSibling(newPageElement);
				}
			}
		},
		{
			label: 'Paste element inside',
			enabled: Boolean(clipboardElement),
			click: () => {
				const newPageElement = clipboardElement && clipboardElement.clone();

				if (newPageElement) {
					element.addChild(newPageElement);
				}
			}
		}
	];

	const menu = Menu.buildFromTemplate(template);
	menu.popup();
}
