import { ElementWrapper } from './elementWrapper';
import { ListItemProps } from '../../lsg/patterns/list';
import { createMenu } from '../../electron/menu';
import { observer } from 'mobx-react';
import { Page } from '../../store/page';
import { PageElement } from '../../store/page/page_element';
import { PropertyValue } from '../../store/page/property_value';
import * as React from 'react';
import { Store } from '../../store';

export interface ElementListProps {
	store: Store;
}

@observer
export class ElementList extends React.Component<ElementListProps> {
	public constructor(props: ElementListProps) {
		super(props);
	}

	public render(): JSX.Element | null {
		const page: Page | undefined = this.props.store.getCurrentPage();
		if (page) {
			const rootElement: PageElement = page.getRoot() as PageElement;
			const selectedElement = this.props.store.getSelectedElement();

			return this.renderList(this.createItemFromElement('Root', rootElement, selectedElement));
		} else {
			return null;
		}
	}

	public componentDidMount(): void {
		createMenu(this.props.store);
	}

	public componentWillUpdate(newProps: ElementListProps): void {
		createMenu(newProps.store);
	}

	public renderList(item: ListItemProps, key?: number): JSX.Element {
		return (
			<ElementWrapper
				title={item.value}
				key={key}
				handleClick={item.onClick}
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

	public createItemFromElement(
		key: string,
		element: PageElement,
		selectedElement?: PageElement
	): ListItemProps {
		if (!element.getPattern()) {
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
					children.length > 1 ? 'Child ' + (index + 1) : 'Child',
					value,
					selectedElement
				)
			);
		});

		const patternPath: string = element.getPatternPath() as string;

		const updatePageElement: React.MouseEventHandler<HTMLElement> = event => {
			event.stopPropagation();
			this.props.store.setSelectedElement(element);
			this.props.store.setElementFocus(true);
		};

		return {
			label: key,
			value: patternPath.replace(/^.*\//, ''),
			onClick: updatePageElement,
			handleDragStart: (e: React.DragEvent<HTMLElement>) => {
				this.props.store.setRearrangeElement(element);
			},
			handleDragDropForChild: (e: React.DragEvent<HTMLElement>) => {
				const transferPatternPath = e.dataTransfer.getData('patternPath');
				const parentElement = element.getParent();
				const pageElement = transferPatternPath
					? new PageElement(this.props.store.getPattern(transferPatternPath), true)
					: this.props.store.getRearrangeElement();

				if (!parentElement || !pageElement) {
					return;
				}

				parentElement.addChild(pageElement, element.getIndex());
				this.props.store.setSelectedElement(pageElement);
			},
			handleDragDrop: (e: React.DragEvent<HTMLElement>) => {
				const transferPatternPath = e.dataTransfer.getData('patternPath');
				const pageElement = transferPatternPath
					? new PageElement(this.props.store.getPattern(transferPatternPath), true)
					: this.props.store.getRearrangeElement();

				if (!pageElement) {
					return;
				}

				element.addChild(pageElement);
				this.props.store.setSelectedElement(pageElement);
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
			return this.createItemFromElement(key, value as PageElement, selectedElement);
		} else {
			const items: ListItemProps[] = [];
			Object.keys(value).forEach((childKey: string) => {
				// tslint:disable-next-line:no-any
				items.push(this.createItemFromProperty(childKey, (value as any)[childKey]));
			});
			return { value: key, children: items };
		}
	}
}
