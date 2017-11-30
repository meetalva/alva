import { ElementValue } from '../../store/page/element_value';
import { List, ListPropsListItem } from '../presentation/list';
import { observer } from 'mobx-react';
import { Page } from '../../store/page';
import { PageElement } from '../../store/page/page_element';
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
		const page: Page | undefined = this.props.store.currentPage;
		if (page) {
			const rootElement: PageElement = page.root as PageElement;
			return (
				<List headline="Elements" items={[this.createItemFromElement('Root', rootElement)]} />
			);
		} else {
			return null;
		}
	}

	public createItemFromElement(key: string, element: PageElement): ListPropsListItem {
		const items: ListPropsListItem[] = [];
		const properties: { [name: string]: ElementValue } = element.properties || {};
		Object.keys(properties).forEach((propertyKey: string) => {
			items.push(this.createItemFromProperty(propertyKey, properties[propertyKey]));
		});
		const children: PageElement[] = element.children || [];
		children.forEach((value: PageElement, index: number) => {
			items.push(this.createItemFromProperty(children.length > 1 ? 'Child ' + (index + 1) : 'Child', value));
		});

		const patternSrc: string = element.patternSrc as string;

		return {
			label: key,
			value: patternSrc.replace(/^.*\//, ''),
			children: items
		};
	}

	public createItemFromProperty(key: string, value: ElementValue): ListPropsListItem {
		if (Array.isArray(value)) {
			const items: ListPropsListItem[] = [];
			(value as (string | number)[]).forEach((child, index: number) => {
				items.push(this.createItemFromProperty(String(index + 1), child));
			});
			return { value: key, children: items };
		}

		if (value === undefined || value === null || typeof value !== 'object') {
			return { label: key, value: String(value) };
		}

		// tslint:disable-next-line:no-any
		const valueAsAny: any = value as any;

		if (valueAsAny['_type'] === 'pattern') {
			return this.createItemFromElement(key, value as PageElement);
		} else {
			const items: ListPropsListItem[] = [];
			Object.keys(value).forEach((childKey: string) => {
				items.push(this.createItemFromProperty(childKey, valueAsAny[childKey]));
			});
			return { value: key, children: items };
		}
	}
}
