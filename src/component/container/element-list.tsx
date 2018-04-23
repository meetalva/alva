import { elementMenu } from '../../electron/context-menus';
import { ElementLocationCommand } from '../../store/command/element-location-command';
import { ElementWrapper } from './element-wrapper';
import { ListItemProps } from '../../lsg/patterns/list';
import { createMenu } from '../../electron/menu';
import { observer } from 'mobx-react';
import { Page } from '../../store/page/page';
import { PageElement } from '../../store/page/page-element';
import { Pattern } from '../../store/styleguide/pattern';
import { PropertyValue } from '../../store/page/property-value';
import * as React from 'react';
import { Store } from '../../store/store';

@observer
export class ElementList extends React.Component {
	public componentDidMount(): void {
		createMenu();
	}

	public componentWillUpdate(): void {
		createMenu();
	}

	public createItemFromElement(
		key: string,
		element: PageElement,
		selectedElement?: PageElement
	): ListItemProps {
		const pattern: Pattern | undefined = element.getPattern();
		if (!pattern) {
			return {
				label: key,
				value: '(invalid)',
				children: []
			};
		}

		const items: ListItemProps[] = [];
		const children: PageElement[] = element.getChildren() || [];
		children.forEach((value: PageElement, index: number) => {
			items.push(
				this.createItemFromProperty(
					children.length > 1 ? `Child ${index + 1}` : 'Child',
					value,
					selectedElement
				)
			);
		});

		const updatePageElement: React.MouseEventHandler<HTMLElement> = event => {
			event.stopPropagation();
			Store.getInstance().setSelectedElement(element);
			Store.getInstance().setElementFocussed(true);
		};

		return {
			label: key,
			value: element.getName(),
			onClick: updatePageElement,
			onContextMenu: () => elementMenu(element),
			handleDragStart: (e: React.DragEvent<HTMLElement>) => {
				Store.getInstance().setDraggedElement(element);
				e.dataTransfer.effectAllowed = 'move';

				let dragElement = e.currentTarget.querySelector('div');

				// restyle the drag image and move it somewhere invisible
				if (dragElement) {
					let dragImg = dragElement.cloneNode(true) as HTMLElement;
					dragImg.setAttribute(
						'style',
						'position: absolute; background-color: #fff; color: #000; padding: 6px 18px; border-radius: 3px; font-size: 12px; opacity: 1; top: 0; left: -500px;'
					);
					document.body.appendChild(dragImg);
					e.dataTransfer.setDragImage(dragImg, 75, 15);
				}
			},
			handleDragDropForChild: (e: React.DragEvent<HTMLElement>) => {
				const patternId = e.dataTransfer.getData('patternId');

				const newParent = element.getParent();
				let draggedElement: PageElement | undefined;

				const store = Store.getInstance();
				if (!patternId) {
					draggedElement = store.getDraggedElement();
				} else {
					const styleguide = store.getStyleguide();
					if (!styleguide) {
						return;
					}

					draggedElement = new PageElement({
						pattern: styleguide.getPattern(patternId),
						setDefaults: true
					});
				}

				if (!newParent || !draggedElement || draggedElement.isAncestorOf(newParent)) {
					return;
				}

				let newIndex = element.getIndex();
				if (draggedElement.getParent() === newParent) {
					const currentIndex = draggedElement.getIndex();
					if (newIndex > currentIndex) {
						newIndex--;
					}
					if (newIndex === currentIndex) {
						return;
					}
				}

				store.execute(ElementLocationCommand.addChild(newParent, draggedElement, newIndex));
				store.setSelectedElement(draggedElement);
			},
			handleDragDrop: (e: React.DragEvent<HTMLElement>) => {
				const patternId = e.dataTransfer.getData('patternId');

				let draggedElement: PageElement | undefined;

				const store = Store.getInstance();
				if (!patternId) {
					draggedElement = store.getDraggedElement();
				} else {
					const styleguide = store.getStyleguide();

					if (!styleguide) {
						return;
					}

					draggedElement = new PageElement({
						pattern: styleguide.getPattern(patternId),
						setDefaults: true
					});
				}

				if (!draggedElement || draggedElement.isAncestorOf(element)) {
					return;
				}

				store.execute(ElementLocationCommand.addChild(element, draggedElement));
				store.setSelectedElement(draggedElement);
			},
			children: items,
			active: element === selectedElement
		};
	}

	public createItemFromProperty(
		key: string,
		value: PropertyValue,
		selectedElement?: PageElement
	): ListItemProps {
		if (value instanceof Array) {
			const items: ListItemProps[] = [];
			(value as (string | number)[]).forEach((child, index: number) => {
				items.push(this.createItemFromProperty(String(index + 1), child));
			});
			return { value: key, children: items };
		}

		if (value === undefined || value === null || typeof value !== 'object') {
			return { label: key, value: String(value) };
		}

		if (value instanceof PageElement) {
			return this.createItemFromElement(key, value, selectedElement);
		} else {
			const items: ListItemProps[] = [];
			Object.keys(value).forEach((childKey: string) => {
				// tslint:disable-next-line:no-any
				items.push(this.createItemFromProperty(childKey, (value as any)[childKey]));
			});
			return { value: key, children: items };
		}
	}

	public render(): JSX.Element | null {
		const store = Store.getInstance();
		const page: Page | undefined = store.getCurrentPage();
		if (page) {
			const rootElement = page.getRoot();

			if (!rootElement) {
				return null;
			}

			const selectedElement = store.getSelectedElement();

			return this.renderList(this.createItemFromElement('Root', rootElement, selectedElement));
		} else {
			return null;
		}
	}

	public renderList(item: ListItemProps, key?: number): JSX.Element {
		return (
			<ElementWrapper
				title={item.value}
				key={key}
				handleClick={item.onClick}
				handleContextMenu={item.onContextMenu}
				active={item.active}
				handleDragStart={item.handleDragStart}
				handleDragDropForChild={item.handleDragDropForChild}
				handleDragDrop={item.handleDragDrop}
			>
				{item.children &&
					item.children.length > 0 &&
					item.children.map((child, index) => this.renderList(child, index))}
			</ElementWrapper>
		);
	}
}
