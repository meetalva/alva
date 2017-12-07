import { ElementWrapper } from './elementWrapper';
import { ListPropsListItem } from '../presentation/list';
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
			return this.renderList(this.createItemFromElement('Root', rootElement));
		} else {
			return null;
		}
	}

	public renderList(item: ListPropsListItem, key?: number): JSX.Element {
		return (
			<ElementWrapper title={item.value} key={key}>
				{item.children && item.children.map((child, index) => this.renderList(child, index))}
			</ElementWrapper>
		);
	}

	public createItemFromElement(key: string, element: PageElement): ListPropsListItem {
		if (!element.getPattern()) {
			return {
				label: key,
				value: '(invalid)',
				children: []
			};
		}

		const items: ListPropsListItem[] = [];
		const children: PageElement[] = element.getChildren() || [];
		children.forEach((value: PageElement, index: number) => {
			items.push(
				this.createItemFromProperty(
					children.length > 1 ? 'Child ' + (index + 1) : 'Child',
					value
				)
			);
		});

		const patternPath: string = element.getPatternPath() as string;

		return {
			label: key,
			value: patternPath.replace(/^.*\//, ''),
			children: items
		};
	}

	public createItemFromProperty(key: string, value: PropertyValue): ListPropsListItem {
		if (value instanceof Array) {
			const items: ListPropsListItem[] = [];
			(value as (string | number)[]).forEach((child, index: number) => {
				items.push(this.createItemFromProperty(String(index + 1), child));
			});
			return { value: key, children: items };
		}

		if (value === undefined || value === null || typeof value !== 'object') {
			return { label: key, value: String(value) };
		}

		if (value instanceof PageElement) {
			return this.createItemFromElement(key, value as PageElement);
		} else {
			const items: ListPropsListItem[] = [];
			Object.keys(value).forEach((childKey: string) => {
				// tslint:disable-next-line:no-any
				items.push(this.createItemFromProperty(childKey, (value as any)[childKey]));
			});
			return { value: key, children: items };
		}
	}
}
