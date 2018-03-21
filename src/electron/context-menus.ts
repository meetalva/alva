import { MenuItemConstructorOptions, remote } from 'electron';
import { ElementCommand } from '../store/command/element-command';
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
				store.execute(ElementCommand.remove(element));
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
				store.execute(ElementCommand.remove(element));
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
					store.execute(ElementCommand.addSibling(element, newPageElement));
				}
			}
		},
		{
			label: 'Paste element inside',
			enabled: Boolean(clipboardElement),
			click: () => {
				const newPageElement = clipboardElement && clipboardElement.clone();

				if (newPageElement) {
					store.execute(ElementCommand.addChild(element, newPageElement));
				}
			}
		}
	];

	const menu = remote.Menu.buildFromTemplate(template);
	menu.popup();
}
